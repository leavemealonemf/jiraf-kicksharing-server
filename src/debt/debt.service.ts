import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Debt } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { CreateDebtDto } from './dto';
import { generateUUID } from '@common/utils';
import { AcquiringService } from 'src/acquiring/acquiring.service';
import { PaymentMethodService } from 'src/payment-method/payment-method.service';

interface IDebtService {
  getAll(): Promise<Debt[]>;
  create(dto: CreateDebtDto): Promise<Debt>;
}

@Injectable()
export class DebtService implements IDebtService {
  private readonly logger = new Logger(DebtService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly acquiringService: AcquiringService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  async getAll(): Promise<Debt[]> {
    return await this.dbService.debt.findMany({
      include: {
        initiator: true,
        intruder: true,
        trip: true,
      },
    });
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
    const debt = await this.checkIsDebtExist(debtUUID);
    const paymentMethod =
      await this.paymentMethodService.getActivePaymentMethod(userId);

    const franchise = await this.dbService.franchise.findFirst({
      where: { id: debt.initiatorId },
    });

    const payment = await this.acquiringService
      .createReccurentPayment(
        {
          amount: debt.price,
          metadata: {
            description: `№ ${debtUUID}`,
            type: 'DEBT',
          },
        },
        userId,
        paymentMethod,
        franchise.youKassaAccount,
        franchise.cloudpaymentsKey,
      )
      .catch((err) => {
        this.logger.error(err);
      });

    if (!payment) {
      throw new BadRequestException(
        `Не удалось обработать транзакцию списания задолженности №${debtUUID}`,
      );
    }

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
}
