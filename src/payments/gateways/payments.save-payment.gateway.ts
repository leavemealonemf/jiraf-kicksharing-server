import { BadRequestException, Logger } from '@nestjs/common';
import { Payment, PaymentMethod } from '@prisma/client';
import { ReccurentPaymentDto } from 'src/acquiring/dtos';
import { DbService } from 'src/db/db.service';

export abstract class SavePaymentGateway {
  abstract savePayment(
    dto: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ): Promise<Payment>;
}

export class SaveBalancePayment implements SavePaymentGateway {
  private readonly logger = new Logger(SaveBalancePayment.name);
  private readonly dbService: DbService;

  constructor() {
    this.dbService = new DbService();
  }

  async savePayment(
    dto: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ): Promise<Payment> {
    return await this.dbService
      .$transaction(async () => {
        const activePayment = await this.dbService.payment.create({
          data: {
            service: 'BALANCE',
            status: 'PAID',
            type: 'REPLACEMENT',
            description: dto.metadata.description,
            userId: userId,
            paymentMethodId: paymentMethod.id,
            amount: dto.amount,
          },
          include: {
            paymentMethod: true,
          },
        });

        await this.dbService.user
          .update({
            where: { id: userId },
            data: {
              balance: { increment: activePayment.amount },
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        return activePayment;
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          'Не удалось обработать транзакцию SaveBalancePayment',
        );
      });
  }
}

export class SaveSubscriptionPayment implements SavePaymentGateway {
  private readonly logger = new Logger(SaveSubscriptionPayment.name);
  private readonly dbService: DbService;

  constructor() {
    this.dbService = new DbService();
  }

  async savePayment(
    dto: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ): Promise<Payment> {
    return await this.dbService.payment.create({
      data: {
        service: 'SUBSCRIPTION',
        status: 'PAID',
        type: 'WRITEOFF',
        description: dto.metadata.description,
        userId: userId,
        paymentMethodId: paymentMethod.id,
        amount: dto.amount,
      },
      include: {
        paymentMethod: true,
      },
    });
  }
}

export class SaveTripPayment implements SavePaymentGateway {
  private readonly logger = new Logger(SaveTripPayment.name);
  private readonly dbService: DbService;

  constructor() {
    this.dbService = new DbService();
  }

  async savePayment(
    dto: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ): Promise<Payment> {
    return await this.dbService.payment
      .create({
        data: {
          service: 'TRIP',
          status: 'PAID',
          type: 'WRITEOFF',
          description: dto.metadata.description,
          userId: userId,
          paymentMethodId: paymentMethod.id,
          amount: dto.amount,
        },
        include: {
          paymentMethod: true,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(`Не удалось сохранить платеж поездки`);
      });
  }
}

export class SaveDebtPayment implements SavePaymentGateway {
  private readonly logger = new Logger(SaveDebtPayment.name);
  private readonly dbService: DbService;

  constructor() {
    this.dbService = new DbService();
  }

  async savePayment(
    dto: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ): Promise<Payment> {
    return await this.dbService
      .$transaction(async () => {
        const activePayment = await this.dbService.payment.create({
          data: {
            service: 'DEBT',
            status: 'PAID',
            type: 'WRITEOFF',
            description: dto.metadata.description,
            userId: userId,
            paymentMethodId: paymentMethod.id,
            amount: dto.amount,
          },
          include: {
            paymentMethod: true,
          },
        });

        await this.dbService.user
          .update({
            where: { id: userId },
            data: {
              balance: { increment: activePayment.amount },
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        return activePayment;
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          'Не удалось обработать транзакцию SaveDebtPayment',
        );
      });
  }
}

export class SaveFinePayment implements SavePaymentGateway {
  private readonly logger = new Logger(SaveDebtPayment.name);
  private readonly dbService: DbService;

  constructor() {
    this.dbService = new DbService();
  }

  async savePayment(
    dto: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ): Promise<Payment> {
    return await this.dbService
      .$transaction(async () => {
        const activePayment = await this.dbService.payment.create({
          data: {
            service: 'FINE',
            status: 'PAID',
            type: 'WRITEOFF',
            description: dto.metadata.description,
            userId: userId,
            paymentMethodId: paymentMethod.id,
            amount: dto.amount,
          },
          include: {
            paymentMethod: true,
          },
        });

        await this.dbService.user
          .update({
            where: { id: userId },
            data: {
              balance: { increment: activePayment.amount },
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        return activePayment;
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          'Не удалось обработать транзакцию SaveFinePayment',
        );
      });
  }
}
