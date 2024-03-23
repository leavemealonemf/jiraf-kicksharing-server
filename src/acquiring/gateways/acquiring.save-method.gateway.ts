import { ICreatePayment, Payment } from '@a2seven/yoo-checkout';
import { v4 as uuidv4 } from 'uuid';
import { SaveAcquiringMethodDto } from '../dtos';
import { BaseAcquiring } from './base.acquiring-class';
import { checkIsAxiosError } from '@common/errors';

export abstract class SaveAcquiringMethodGateway {
  abstract saveAcquiringMethodProcess(
    dto: SaveAcquiringMethodDto,
  ): Promise<Payment>;
}

export class SaveBankCardGateway
  extends BaseAcquiring
  implements SaveAcquiringMethodGateway
{
  constructor() {
    super(SaveBankCardGateway.name);
  }

  async saveAcquiringMethodProcess(
    dto: SaveAcquiringMethodDto,
  ): Promise<Payment> {
    const idempotence = uuidv4();

    this.logger.log('Вошли в привязку банковской карты');

    const createPayload: ICreatePayment = {
      amount: {
        value: '15.00',
        currency: 'RUB',
      },
      payment_method_data: {
        type: dto.paymentType,
      },
      confirmation: {
        type: 'redirect',
        return_url: this.config.get('CASSA_RETURN_URL'),
      },
      capture: true,
      description: 'Привязка метода',
      save_payment_method: true,
    };

    try {
      const payment = await this.checkout
        .createPayment(createPayload, idempotence)
        .catch((err) => {
          this.logger.error(err);
          return null;
        });

      //   if (payment.status === 'canceled') {
      //     throw new Error(
      //       'Не удалось привязать способ оплаты, ошибка при обработке платежа',
      //     );
      //   }

      return payment;
    } catch (error) {
      checkIsAxiosError(error);
    }
  }
}

export class SaveSbpGateway
  extends BaseAcquiring
  implements SaveAcquiringMethodGateway
{
  constructor() {
    super(SaveSbpGateway.name);
  }

  async saveAcquiringMethodProcess(
    dto: SaveAcquiringMethodDto,
  ): Promise<Payment> {
    const idempotence = uuidv4();

    this.logger.log('Вошли в привязку быстрых платежей');

    const createPayload: ICreatePayment = {
      amount: {
        value: '15.00',
        currency: 'RUB',
      },
      payment_method_data: {
        type: dto.paymentType,
      },
      confirmation: {
        type: 'redirect',
        return_url: this.config.get('CASSA_RETURN_URL'),
      },
      capture: true,
      description: 'Привязка метода',
      save_payment_method: true,
    };

    try {
      const payment: Payment = await this.checkout.createPayment(
        createPayload,
        idempotence,
      );

      //   if (payment.status === 'canceled') {
      //     throw new Error(
      //       'Не удалось привязать способ оплаты, ошибка при обработке платежа',
      //     );
      //   }

      return payment;
    } catch (error) {
      checkIsAxiosError(error);
    }
  }
}

export class SaveSberbankGateway
  extends BaseAcquiring
  implements SaveAcquiringMethodGateway
{
  constructor() {
    super(SaveSberbankGateway.name);
  }

  async saveAcquiringMethodProcess(
    dto: SaveAcquiringMethodDto,
  ): Promise<Payment> {
    const idempotence = uuidv4();

    this.logger.log('Вошли в привязку сбербанка');

    const createPayload: ICreatePayment = {
      amount: {
        value: '15.00',
        currency: 'RUB',
      },
      payment_method_data: {
        type: dto.paymentType,
      },
      confirmation: {
        type: 'redirect',
        return_url: this.config.get('CASSA_RETURN_URL'),
      },
      capture: true,
      description: 'Привязка метода',
      save_payment_method: true,
    };

    try {
      const payment: Payment = await this.checkout.createPayment(
        createPayload,
        idempotence,
      );

      //   if (payment.status === 'canceled') {
      //     throw new Error(
      //       'Не удалось привязать способ оплаты, ошибка при обработке платежа',
      //     );
      //   }

      return payment;
    } catch (error) {
      checkIsAxiosError(error);
    }
  }
}
