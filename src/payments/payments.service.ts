import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  YooCheckout,
  ICreatePayment,
  ICapturePayment,
} from '@a2seven/yoo-checkout';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { AddPaymentMethodDto } from './dto/add-payment-method.dto';
import { DbService } from 'src/db/db.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  PaymentDescription,
  PaymentEvent,
  PaymentStatusDto,
} from './dto/payment-status.dto';
import { UserService } from 'src/user/user.service';
import { PaymentMethod } from '@prisma/client';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  private readonly checkout = new YooCheckout({
    shopId: this.configService.get('CASSA_SHOP_ID'),
    secretKey: this.configService.get('CASSA_KEY'),
  });
  private readonly logger = new Logger();

  constructor(
    private readonly configService: ConfigService,
    private readonly dbService: DbService,
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async addPaymentMethod(dto: AddPaymentMethodDto) {
    const idempotence = uuidv4();

    const createPayload: ICreatePayment = {
      amount: {
        value: '15.00',
        currency: 'RUB',
      },
      payment_method_data: {
        type: 'bank_card',
      },
      confirmation: {
        type: 'redirect',
        return_url: 'http://localhost:3000/api',
      },
      // capture: true,
      description: 'Привязка метода',
      save_payment_method: true,
    };

    try {
      const payment = await this.checkout.createPayment(
        createPayload,
        idempotence,
      );

      const savedPayment = await this.dbService.paymentMethod
        .create({
          data: {
            active: true,
            idempotenceKey: idempotence,
            type: 'CARD',
            userId: dto.userId,
            paymentId: payment.id,
          },
        })
        .catch((err) => {
          this.logger.error(err);
          return null;
        });

      // console.log(payment);
      return { payment: payment, savedPayment: savedPayment };
    } catch (error) {
      console.error(error);
      return error.message;
    }
  }

  async createPayment(dto: CreatePaymentDto) {
    const createPayload: ICreatePayment = {
      amount: {
        value: dto.value.toFixed(),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: 'http://localhost:3000/api',
      },
      metadata: {
        type: dto.metadata.type,
        description: dto.metadata.description,
      },
      capture: true,
      description: dto.description,
    };

    if (dto.paymentMethodStringId) {
      createPayload['payment_method_id'] = dto.paymentMethodStringId;
    }

    try {
      const payment = await this.checkout.createPayment(
        createPayload,
        uuidv4(),
      );
      if (payment.status === 'succeeded') {
        const activePayment = await this.dbService.payment.create({
          data: {
            service:
              dto.metadata.type === 'SUBSCRIPTION'
                ? 'SUBSCRIPTION'
                : dto.metadata.type === 'BALANCE'
                  ? 'BALANCE'
                  : 'TRIP',
            status: 'PAID',
            type: dto.metadata.type === 'BALANCE' ? 'REPLACEMENT' : 'WRITEOFF',
            description: dto.description,
            userId: dto.userId,
            paymentMethodId: dto.paymentMethodId,
            amount: dto.value,
          },
        });

        if (!activePayment) {
          throw new ForbiddenException('Не удалось зарегистрировать платеж');
        }

        const user = await this.userService.findOne(activePayment.userId);

        if (dto.metadata.type === 'BALANCE') {
          this.userService.update(activePayment.userId, {
            balance: user.balance + dto.value,
          });
        }

        if (dto.metadata.type === 'SUBSCRIPTION') {
          const subscription = await this.subscriptionService.findOne(
            Number(dto.metadata.description.split(' ')[1]),
          );

          const subscriptionParams =
            await this.dbService.userSubscriptionsOptions.create({
              data: {
                expDate: new Date(
                  new Date().getTime() +
                    subscription.days * 24 * 60 * 60 * 1000,
                ),
                userId: user.id,
                subscriptionId: subscription.id,
              },
            });
          if (!subscriptionParams) {
            throw new ForbiddenException(
              'Не удалось создать параметры подписки',
            );
          }
        }

        return activePayment;
      }
      if (payment.status === 'canceled') {
        throw new BadRequestException('Недостаточно средств');
      }

      console.log(payment);
      return payment;
    } catch (error) {
      console.error(error);
      return error.message;
    }
  }

  async getPaymentStatus(dto: PaymentStatusDto) {
    if (
      dto.event === PaymentEvent.CAPTURE &&
      dto.object.description === PaymentDescription.ADD_PAYMENT_METHOD
    ) {
      const payment = await this.dbService.paymentMethod.findFirst({
        where: { paymentId: dto.object.id },
      });

      if (!payment) {
        return;
      }

      if (payment && payment.cardFirstSix && payment.cardFirstSix !== null) {
        return;
      }

      const cancelPayment = await this.cancelPayment(dto.object.id);

      if (!cancelPayment) {
        throw new ForbiddenException('Не удалось отменить платеж');
      }

      await this.dbService.paymentMethod
        .update({
          where: { paymentId: dto.object.id },
          data: {
            cardType: dto.object.payment_method.card.card_type,
            cardFirstSix: dto.object.payment_method.card.first6,
            cardLastFour: dto.object.payment_method.card.last4,
            expYear: dto.object.payment_method.card.expiry_year,
            expMonth: dto.object.payment_method.card.expiry_month,
            userId: payment.userId,
          },
        })
        .catch((err) => {
          this.logger.error(err);
        });
      await this.checkIsCardAlreadyExist(dto, payment);
      console.log(dto);
    }
    return dto;
  }

  async getPayment() {
    try {
      const payment = await this.checkout.getPayment(
        '2d6bf96d-000f-5000-8000-10e927cd181f',
      );
      console.log(payment);
      return payment;
    } catch (error) {
      console.error(error);
    }
  }

  async capturePayment(paymentId: string) {
    const capturePayload: ICapturePayment = {
      amount: {
        value: '15.00',
        currency: 'RUB',
      },
    };

    try {
      const payment = await this.checkout.capturePayment(
        paymentId,
        capturePayload,
        uuidv4(),
      );
      console.log(payment);
      return payment;
    } catch (error) {
      console.error(error);
      return error.message;
    }
  }

  async getAllPayments() {
    return this.dbService.paymentMethod.findMany();
  }

  async deletePayment(id: number) {
    return this.dbService.paymentMethod.delete({ where: { id } });
  }

  async cancelPayment(paymentId: string) {
    return this.checkout.cancelPayment(paymentId, uuidv4()).catch((err) => {
      this.logger.error(err);
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkSubscriptionExp() {
    const subscriptions =
      await this.dbService.userSubscriptionsOptions.findMany();
    if (subscriptions.length === 0) return;

    subscriptions.forEach(async (x) => {
      if (x.expDate > new Date()) {
        this.logger.log(`Есть отложенный платеж ${x.id}`);
        return;
      }

      const user = await this.userService.findOne(x.userId);
      const subscription = await this.subscriptionService.findOne(
        x.subscriptionId,
      );

      if (!x.autoPayment) {
        await this.dbService.userSubscriptionsOptions
          .delete({ where: { id: x.id } })
          .catch((err) => {
            this.logger.error(err);
          });
        this.logger.log(`Удалили подписку без автоплатежа под id: ${x.id}`);
        return;
      }

      const activePaymentMethod = user.paymentMethods.find(
        (y) => y.id === user.activePaymentMethod,
      );

      const createPayload: ICreatePayment = {
        amount: {
          value: subscription.price.toFixed(),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: 'http://localhost:3000/api',
        },
        metadata: {
          type: 'SUBSCRIPTION',
          description: `Подписка ${subscription.id}`,
        },
        capture: true,
        description: 'Автопродление подписки',
        payment_method_id: activePaymentMethod.paymentId,
      };

      try {
        const payment = await this.checkout.createPayment(
          createPayload,
          uuidv4(),
        );
        if (payment.status === 'succeeded') {
          const updatedSubscription =
            await this.dbService.userSubscriptionsOptions
              .update({
                where: { id: x.id },
                data: {
                  expDate: new Date(
                    new Date().getTime() +
                      subscription.days * 24 * 60 * 60 * 1000,
                  ),
                },
              })
              .catch((err) => {
                this.logger.error(
                  err,
                  undefined,
                  `Не удалось обновить опции подписки с id: ${x.id}`,
                );
              });
          this.logger.log(
            `Провели списание и обновили подписку под id ${x.id}`,
          );
          return updatedSubscription;
        }

        if (payment.status === 'canceled') {
          await this.dbService.userSubscriptionsOptions
            .delete({ where: { id: x.id } })
            .catch((err) => {
              this.logger.error(err);
            });

          this.logger.log(`Платеж в статусе отмены, подписка с id ${x.id}`);

          throw new BadRequestException(
            'Ошибка, возможно недостаточно средств',
          );
        }
      } catch (error) {
        console.error(error);
        return error.message;
      }
    });
  }

  private async checkIsCardAlreadyExist(
    dto: PaymentStatusDto,
    payment: PaymentMethod,
  ) {
    // const payment = await this.dbService.paymentMethod.findFirst({
    //   where: { paymentId: dto.object.id },
    // });
    const user = await this.userService.findOne(payment.userId);

    const existedCard = user.paymentMethods.find((card) => {
      return (
        card.cardFirstSix === dto.object.payment_method.card.first6 &&
        card.cardLastFour === dto.object.payment_method.card.last4 &&
        card.expYear === dto.object.payment_method.card.expiry_year &&
        card.expMonth === dto.object.payment_method.card.expiry_month
      );
    });

    if (typeof existedCard === 'undefined') {
      return;
    }

    if (existedCard.id === payment.id) {
      return;
    }

    await this.dbService.paymentMethod
      .delete({ where: { id: existedCard.id } })
      .catch((err) => {
        this.logger.error(err);
      });

    if (user.paymentMethods.length === 0) {
      await this.userService.update(payment.userId, {
        activePaymentMethod: payment.id,
      });
    }
  }
}
