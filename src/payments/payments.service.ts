import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { DbService } from 'src/db/db.service';

import { UserService } from 'src/user/user.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReccurentPaymentDto } from 'src/acquiring/dtos';
import { SavePaymentGateway } from './gateways';
import { SavePaymentFabric } from './gateways/payments.save-paymnet.fabric';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly checkout = new YooCheckout({
    shopId: this.configService.get('CASSA_SHOP_ID'),
    secretKey: this.configService.get('CASSA_KEY'),
  });
  private readonly logger = new Logger(PaymentsService.name);

  private savePaymentsGateways: Record<string, SavePaymentGateway> = {};

  constructor(
    private readonly configService: ConfigService,
    private readonly dbService: DbService,
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly gatewayFabric: SavePaymentFabric,
  ) {}

  public rigisterPaymentGateway(
    dto: ReccurentPaymentDto,
    gateway: SavePaymentGateway,
  ) {
    this.savePaymentsGateways[dto.metadata.type] = gateway;
  }

  async savePayment(
    dto: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ) {
    const fabric = this.gatewayFabric.getGateway(dto);

    if (!fabric) {
      throw new BadRequestException(
        'Платеж с типом ' + dto.metadata.type + ' невозможно сохранить!',
      );
    }

    this.rigisterPaymentGateway(dto, fabric);

    const gateway = this.savePaymentsGateways[dto.metadata.type];
    if (!gateway) {
      throw new Error('Невозможно сохранить платеж');
    }

    return await gateway.savePayment(dto, userId, paymentMethod);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkSubscriptionExp() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const subscriptions =
      await this.dbService.userSubscriptionsOptions.findMany({
        where: {
          expDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

    if (subscriptions.length === 0) {
      return;
    }

    subscriptions.forEach(async (x) => {
      // if (x.expDate > new Date()) {
      //   this.logger.log(`Есть отложенный платеж ${x.id}`);
      //   return;
      // }

      if (!x.autoPayment) {
        await this.dbService.userSubscriptionsOptions
          .delete({ where: { id: x.id } })
          .catch((err) => {
            this.logger.error(err);
            return null;
          });
        this.logger.log(`Удалили подписку без автоплатежа под id: ${x.id}`);
        return;
      }

      const user = await this.userService.findOne(x.userId);
      const subscription = await this.subscriptionService.findOne(
        x.subscriptionId,
      );

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
          return_url: this.configService.get('CASSA_RETURN_URL'),
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
                  purchaseDate: new Date(),
                  expDate: new Date(
                    new Date().getTime() +
                      this.getSubscriptionExpDate(subscription.days),
                  ),
                },
              })
              .catch((err) => {
                this.logger.error(
                  err,
                  undefined,
                  `Не удалось обновить опции подписки с id: ${x.id}`,
                );
                return null;
              });

          await this.dbService.payment
            .create({
              data: {
                service: 'SUBSCRIPTION',
                status: 'PAID',
                type: 'WRITEOFF',
                description: `На ${subscription.days} дней`,
                userId: x.userId,
                paymentMethodId: activePaymentMethod.id,
                amount: subscription.price,
              },
            })
            .catch((err) => {
              this.logger.error(err);
              return null;
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
              return null;
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

  private getSubscriptionExpDate(days: number) {
    return days * 24 * 60 * 60 * 1000;
  }
}
