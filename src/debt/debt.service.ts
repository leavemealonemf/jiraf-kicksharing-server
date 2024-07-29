import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Debt, ErpUser, ErpUserRoles } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { CreateDebtDto } from './dto';
import { generateUUID } from '@common/utils';
import { AcquiringService } from 'src/acquiring/acquiring.service';
import { PaymentMethodService } from 'src/payment-method/payment-method.service';
import { PaymentsService } from 'src/payments/payments.service';

interface IDebtService {
  getAll(erpUser: ErpUser): Promise<Debt[]>;
  create(dto: CreateDebtDto): Promise<Debt>;
}

@Injectable()
export class DebtService implements IDebtService {
  private readonly logger = new Logger(DebtService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly acquiringService: AcquiringService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getAll(erpUser: ErpUser): Promise<Debt[]> {
    const debts = await this.getDebtsByRole(erpUser);
    return debts;
  }

  async create(dto: CreateDebtDto): Promise<Debt> {
    const trip = await this.dbService.trip
      .findFirst({
        where: { tripId: dto.tripUUID },
        select: {
          id: true,
          userId: true,
          scooter: {
            select: {
              franchiseId: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!trip) {
      throw new BadRequestException(
        'Не удалось найти поездку для оформления задолженности',
      );
    }

    const genTripUUID = generateUUID();

    return await this.dbService.debt
      .create({
        data: {
          tripUUID: dto.tripUUID,
          price: dto.price,
          debtUUID: genTripUUID,
          initiatorId: trip.scooter.franchiseId,
          intruderId: trip.userId,
          tripId: trip.id,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('Не удалось создать задолженность');
      });
  }

  async payOfDebt(userId: number, debtUUID: string) {
    const user = await this.dbService.user
      .findFirst({ where: { id: userId } })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!user) {
      throw new BadRequestException('Не удалось найти пользователя');
    }

    const debt = await this.checkIsDebtExist(debtUUID);
    const paymentMethod =
      await this.paymentMethodService.getActivePaymentMethod(userId);

    const franchise = await this.dbService.franchise.findFirst({
      where: { id: debt.initiatorId },
    });

    const acquiringPayment = await this.acquiringService
      .createReccurentPayment(
        {
          amount: debt.price,
          metadata: {
            description: `№ ${debtUUID}`,
            type: 'DEBT',
            isReceiptIncludes: true,
            receiptData: {
              receiptType: 'DEBT',
              servicePrice: debt.price,
            },
          },
        },
        userId,
        user.phone,
        paymentMethod,
        franchise.youKassaAccount,
        franchise.cloudpaymentsKey,
      )
      .catch((err) => {
        this.logger.error(err);
      });

    if (!acquiringPayment) {
      throw new BadRequestException(
        `Не удалось обработать транзакцию списания задолженности №${debtUUID}`,
      );
    }

    await this.paymentsService.savePayment(
      {
        amount: debt.price,
        metadata: {
          description: `№ ${debtUUID}`,
          type: 'DEBT',
        },
      },
      userId,
      paymentMethod,
    );

    return await this.dbService.debt
      .update({
        where: { id: debt.id },
        data: {
          closedAt: new Date().toISOString(),
          paidStatus: 'PAID',
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          `Не удалось обновить задолженность №${debtUUID}`,
        );
      });
  }

  async deleteDebt(uuid: string, erpUser: ErpUser) {
    const isAccess = this.checkRoleDeleteDebtPermisson(
      erpUser.role,
      erpUser.franchiseEmployeeId,
    );

    if (!isAccess) {
      throw new BadRequestException(
        'У вас недостаточно прав для выполнения операции',
      );
    }

    await this.checkIsDebtExist(uuid);

    return await this.dbService.debt
      .delete({ where: { debtUUID: uuid } })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          'Не удалось удалить задолженность с id:' + uuid,
        );
      });
  }

  private async checkIsDebtExist(debtUUID: string): Promise<Debt> {
    const debt = await this.dbService.debt
      .findFirst({
        where: { debtUUID: debtUUID },
      })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!debt) {
      throw new BadRequestException(
        `Задолженности с идентификатором ${debtUUID} не найдено`,
      );
    }

    return debt;
  }

  private checkRoleDeleteDebtPermisson(
    role: ErpUserRoles,
    franchiseId: number,
  ): boolean {
    if (role === 'ADMIN') {
      return true;
    }

    if (role === 'FRANCHISE' && franchiseId) {
      return true;
    }
    return false;
  }

  private async getDebtsByRole(erpUser: ErpUser): Promise<Debt[]> {
    const debts = [];
    if (erpUser.role === 'ADMIN' || erpUser.role === 'EMPLOYEE') {
      const res = await this.dbService.debt.findMany({
        include: {
          initiator: {
            include: {
              city: {
                select: {
                  name: true,
                },
              },
            },
          },
          intruder: {
            select: {
              id: true,
              clientId: true,
              name: true,
            },
          },
          trip: {
            select: {
              scooter: {
                select: {
                  deviceId: true,
                },
              },
            },
          },
        },
      });
      debts.push(...res);
    } else {
      const res = await this.dbService.debt.findMany({
        where: { initiatorId: erpUser.franchiseEmployeeId },
        include: {
          initiator: {
            include: {
              city: {
                select: {
                  name: true,
                },
              },
            },
          },
          intruder: {
            select: {
              id: true,
              clientId: true,
              name: true,
            },
          },
          trip: {
            select: {
              scooter: {
                select: {
                  deviceId: true,
                },
              },
            },
          },
        },
      });
      debts.push(...res);
    }
    return debts;
  }
}
