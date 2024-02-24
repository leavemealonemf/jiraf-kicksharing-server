import { Injectable } from '@nestjs/common';
import {
  YooCheckout,
  ICreatePayment,
  ICapturePayment,
} from '@a2seven/yoo-checkout';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { AddPaymentMethodDto } from './dto/add-payment-method.dto';
import { DbService } from 'src/db/db.service';

@Injectable()
export class PaymentsService {
  private readonly checkout = new YooCheckout({
    shopId: this.configService.get('CASSA_SHOP_ID'),
    secretKey: this.configService.get('CASSA_KEY'),
  });
  private idempotenceKey = uuidv4();
  private readonly paymentId = '2d6c0f63-000f-5000-8000-15f38c41829e';

  constructor(
    private readonly configService: ConfigService,
    private readonly dbService: DbService,
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
      capture: true,
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

      console.log(payment);
      return { payment: payment, savedPayment: savedPayment };
    } catch (error) {
      console.error(error);
      return error.message;
    }
  }

  async createPayment() {
    // const idempotenceKey = uuidv4();
    const createPayload: ICreatePayment = {
      amount: {
        value: '100.00',
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

  async capturePayment() {
    const capturePayload: ICapturePayment = {
      amount: {
        value: '2.00',
        currency: 'RUB',
      },
    };

    try {
      const payment = await this.checkout.capturePayment(
        this.paymentId,
        capturePayload,
        this.idempotenceKey,
      );
      console.log(payment);
      return payment;
    } catch (error) {
      console.error(error);
      return error.message;
    }
  }

  async cancelPayment() {
    try {
      const payment = await this.checkout.cancelPayment(
        this.paymentId,
        this.idempotenceKey,
      );
      console.log(payment);
      return payment;
    } catch (error) {
      console.error(error);
      // throw new Error(error.message)
    }
  }
}
