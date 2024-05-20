import { ICreatePayment, Payment } from '@a2seven/yoo-checkout';
import { v4 as uuidv4 } from 'uuid';
import { AcquiringProcessPaymentDto } from '../dtos';
import { BaseAcquiring } from './base.acquiring-class';
import { checkIsAxiosError } from '@common/errors';
import { Injectable } from '@nestjs/common';

// export abstract class AcquiringProcessPaymentGateway {
//   abstract processPayment(dto: AcquiringProcessPaymentDto): Promise<Payment>;
// }

@Injectable()
export class AcquiringProcessPayment extends BaseAcquiring {
  constructor() {
    super(AcquiringProcessPayment.name);
  }

  async processPayment(dto: AcquiringProcessPaymentDto): Promise<Payment> {
    const idempotence = uuidv4();

    this.logger.log('Вошли в процесс платеж');

    const createPayload: ICreatePayment = {
      amount: {
        value: dto.value.toString(),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: this.config.get('CASSA_RETURN_URL'),
      },
      metadata: {
        type: dto.metadata.type,
        description: dto.metadata.description,
      },
      payment_method_id: dto.paymentMethodStringId,
      capture: true,
      description: dto.description,
    };

    try {
      const payment = await this.checkout
        .createPayment(createPayload, idempotence)
        .catch((err) => {
          this.logger.error(err);
          return null;
        });

      return payment;
    } catch (error) {
      checkIsAxiosError(error);
    }
  }

  async processPaymentTwoSteps(
    dto: AcquiringProcessPaymentDto,
  ): Promise<Payment> {
    const idempotence = uuidv4();

    this.logger.log('Вошли в процесс платеж');

    const createPayload: ICreatePayment = {
      amount: {
        value: dto.value.toString(),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: this.config.get('CASSA_RETURN_URL'),
      },
      metadata: {
        type: dto.metadata.type,
        description: dto.metadata.description,
      },
      payment_method_id: dto.paymentMethodStringId,
      capture: false,
      description: dto.description,
    };

    try {
      const payment = await this.checkout
        .createPayment(createPayload, idempotence)
        .catch((err) => {
          this.logger.error(err);
          return null;
        });

      return payment;
    } catch (error) {
      checkIsAxiosError(error);
    }
  }

  async cancelProcessPayment(paymentId: string): Promise<Payment> {
    const idempotence = uuidv4();

    this.logger.log('Вошли в процесс отмены платежа');

    try {
      const payment = await this.checkout
        .cancelPayment(paymentId, idempotence)
        .catch((err) => {
          this.logger.error(err);
          return null;
        });

      return payment;
    } catch (error) {
      checkIsAxiosError(error);
    }
  }
}
