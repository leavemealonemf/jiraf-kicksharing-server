import { Payment } from '@a2seven/yoo-checkout';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import {
  AcquiringPaymentDescription,
  AcquiringPaymentStatusDto,
} from 'src/acquiring/dtos';
import { DbService } from 'src/db/db.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PaymentMethodService {
  private readonly logger = new Logger(PaymentMethodService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly userService: UserService,
  ) {}

  async getUserPaymentMethod(userId: number, methodId: number) {
    return this.dbService.paymentMethod
      .findUnique({
        where: { id: methodId, userId: userId },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException(
          `Платежного метода с id: ${methodId} не существует`,
        );
      });
  }

  async savePaymentMethod(payment: Payment, userId: number) {
    const savedPayment = await this.dbService.paymentMethod
      .create({
        data: {
          active: false,
          type: payment.payment_method.type,
          userId: userId,
          paymentId: payment.id,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
    return savedPayment;
  }

  async agreementPaymentMethodPhase(dto: AcquiringPaymentStatusDto) {
    if (!dto) {
      return null;
    }

    if (
      dto.object.description !== AcquiringPaymentDescription.ADD_PAYMENT_METHOD
    ) {
      return null;
    }

    const isPaymentMethodExist: PaymentMethod =
      await this.dbService.paymentMethod
        .findFirst({
          where: { paymentId: dto.object.id },
        })
        .catch((err) => {
          this.logger.error(err);
          return null;
        });

    const updatedPaymentMethod = await this.dbService.paymentMethod
      .update({
        where: { id: isPaymentMethodExist.id },
        data: {
          active: true,
          cardType: dto.object.payment_method.card.card_type,
          cardFirstSix: dto.object.payment_method.card.first6,
          cardLastFour: dto.object.payment_method.card.last4,
          expYear: dto.object.payment_method.card.expiry_year,
          expMonth: dto.object.payment_method.card.expiry_month,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!updatedPaymentMethod) {
      throw new Error(
        'Не удалось подтвердить платежный метод ' + dto.object.id,
      );
    }

    await this.checkIsCardAlreadyExist(dto, updatedPaymentMethod);
  }

  private async checkIsCardAlreadyExist(
    dto: AcquiringPaymentStatusDto,
    payment: PaymentMethod,
  ) {
    const user = await this.userService.findOne(payment.userId).catch((err) => {
      this.logger.error(err);
      return null;
    });

    const existedCard = user.paymentMethods.find((card) => {
      return (
        card.cardFirstSix === dto.object.payment_method.card.first6 &&
        card.cardLastFour === dto.object.payment_method.card.last4 &&
        card.expYear === dto.object.payment_method.card.expiry_year &&
        card.expMonth === dto.object.payment_method.card.expiry_month
      );
    });

    if (typeof existedCard === 'undefined') {
      return null;
    }

    if (existedCard.id === payment.id) {
      return null;
    }

    await this.dbService.paymentMethod
      .delete({ where: { id: existedCard.id } })
      .catch((err) => {
        this.logger.error(err);
      });

    if (user.paymentMethods.length > 0) {
      await this.userService
        .update(payment.userId, {
          activePaymentMethod: payment.id,
        })
        .catch((err) => {
          this.logger.error(err);
        });
    }
  }
}
