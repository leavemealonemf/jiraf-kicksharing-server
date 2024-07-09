import { Payment } from '@a2seven/yoo-checkout';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import {
  AcquiringPaymentDescription,
  AcquiringPaymentStatusDto,
} from 'src/acquiring/dtos';
import { DbService } from 'src/db/db.service';
import { UserService } from 'src/user/user.service';
import { IDefaultTransactionNotification } from 'src/acquiring/gateways-provider/cloudpayments/interfaces';

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

  async agreementPaymentMehodCloudPayments(
    response: IDefaultTransactionNotification,
    userId: number,
  ) {
    if (!response) {
      return false;
    }

    const cardExpData = response.CardExpDate.split('/');

    await this.dbService.paymentMethod
      .create({
        data: {
          paymentId: response.Token,
          cardType: response.CardType,
          type: 'bank_card',
          active: true,
          cardFirstSix: response.CardFirstSix,
          cardLastFour: response.CardLastFour,
          userId: userId,
          accountId: response.AccountId,
          expMonth: cardExpData[0],
          expYear: cardExpData[1],
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return false;
      });

    return true;
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

  async getActivePaymentMethod(userId: number): Promise<PaymentMethod> {
    const user = await this.dbService.user.findFirst({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException(
        'Такого пользователя не существует: ' + JSON.stringify(user),
      );
    }

    const paymentMethod = await this.checkIsPaymentMethodExist(
      user.activePaymentMethod,
      user.id,
    );

    if (!paymentMethod) {
      throw new BadRequestException(
        `Ошибка. Платежного метода с id ${user.activePaymentMethod} не существует или он не активен`,
      );
    }

    if (!paymentMethod.active) {
      throw new BadRequestException(
        `Ошибка. Невозможно использовать данный платежный метод`,
      );
    }

    return paymentMethod;
  }

  private async checkIsPaymentMethodExist(
    paymentId: number,
    userId: number,
  ): Promise<PaymentMethod | null> {
    const paymentMethod = await this.dbService.paymentMethod
      .findFirst({
        where: { id: paymentId },
      })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!paymentMethod) {
      return null;
    }

    if (paymentMethod.userId !== userId) {
      return null;
    }

    return paymentMethod;
  }
}
