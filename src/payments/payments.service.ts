import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
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

      const savedPayment = await this.dbService.paymentMethod.create({
        data: {
          active: true,
          idempotenceKey: idempotence,
          type: 'CARD',
          userId: dto.userId,
          paymentId: payment.id,
        },
      });

      // console.log(payment);
      return { payment: payment, savedPayment: savedPayment };
    } catch (error) {
      console.error(error);
      return error.message;
    }
  }

  async createPayment(dto: CreatePaymentDto) {
    // const idempotenceKey = uuidv4();
    const createPayload: ICreatePayment = {
      amount: {
        value: dto.value.toFixed(),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: 'http://localhost:3000/api',
      },
      capture: true,
      description: 'Аренда скутера',
      payment_method_id: '2d6c3c94-000f-5000-8000-1941e9e48ae2',
    };

    try {
      const payment = await this.checkout.createPayment(
        createPayload,
        uuidv4(),
      );
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

  async cancelPayment(paymentId: string) {
    return this.checkout.cancelPayment(paymentId, uuidv4()).catch((err) => {
      this.logger.error(err);
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
      .delete({ where: { id: existedCard.id }})
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
