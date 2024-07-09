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

// export class SaveSubscriptionPayment implements SavePaymentGateway {
//   private readonly logger = new Logger(SaveSubscriptionPayment.name);
//   private readonly dbService: DbService;

//   constructor() {
//     this.dbService = new DbService();
//   }

//   async savePayment(
//     dto: AcquiringProcessPaymentDto,
//     userId: number,
//   ): Promise<Payment> {
//     const isPaymentMethodExist = await this.checkIsPaymentMethodExist(
//       dto.paymentMethodId,
//     );

//     if (!isPaymentMethodExist) {
//       throw new BadRequestException(
//         `Ошибка. Платежного метода с id ${dto.paymentMethodId} не существует`,
//       );
//     }

//     if (!isPaymentMethodExist.active) {
//       throw new BadRequestException(
//         `Ошибка. Невозможно произвести платеж с данного платежного метода`,
//       );
//     }

//     const activePayment = await this.dbService.payment.create({
//       data: {
//         service: 'SUBSCRIPTION',
//         status: 'PAID',
//         type: 'WRITEOFF',
//         description: dto.description,
//         userId: userId,
//         paymentMethodId: dto.paymentMethodId,
//         amount: dto.value,
//       },
//       include: {
//         paymentMethod: true,
//       },
//     });

//     return activePayment;
//   }

//   private async checkIsPaymentMethodExist(paymnetId: number) {
//     const paymentMethod = await this.dbService.paymentMethod.findFirst({
//       where: { id: paymnetId },
//     });

//     if (!paymentMethod) {
//       return null;
//     }

//     return paymentMethod;
//   }
// }

// export class SaveTripPayment implements SavePaymentGateway {
//   private readonly logger = new Logger(SaveTripPayment.name);
//   private readonly dbService: DbService;

//   constructor() {
//     this.dbService = new DbService();
//   }

//   async savePayment(
//     dto: AcquiringProcessPaymentDto,
//     userId: number,
//   ): Promise<Payment> {
//     const isPaymentMethodExist = await this.checkIsPaymentMethodExist(
//       dto.paymentMethodId,
//     );

//     if (!isPaymentMethodExist) {
//       throw new BadRequestException(
//         `Ошибка. Платежного метода с id ${dto.paymentMethodId} не существует`,
//       );
//     }

//     if (!isPaymentMethodExist.active) {
//       throw new BadRequestException(
//         `Ошибка. Невозможно произвести платеж с данного платежного метода`,
//       );
//     }

//     const activePayment = await this.dbService.payment.create({
//       data: {
//         service: 'TRIP',
//         status: 'PAID',
//         type: 'WRITEOFF',
//         description: dto.description,
//         userId: userId,
//         paymentMethodId: dto.paymentMethodId,
//         amount: dto.value,
//         bonusesUsed: dto.metadata.tripBonusesUsed,
//       },
//       include: {
//         paymentMethod: true,
//       },
//     });

//     return activePayment;
//   }

//   private async checkIsPaymentMethodExist(paymnetId: number) {
//     const paymentMethod = await this.dbService.paymentMethod.findFirst({
//       where: { id: paymnetId },
//     });

//     if (!paymentMethod) {
//       return null;
//     }

//     return paymentMethod;
//   }
// }
