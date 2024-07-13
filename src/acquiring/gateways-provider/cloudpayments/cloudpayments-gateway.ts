import { BadRequestException, Logger } from '@nestjs/common';
import { AcquiringProvider } from '../base';
import { ClientService, ReceiptTypes } from 'cloudpayments';
import { IVoidPaymentData } from './interfaces';
import * as uuid from 'uuid';
import { ReccurentPaymentDto } from 'src/acquiring/dtos';
import { PaymentMethod } from '@prisma/client';

export class CloudPaymentsGateway extends AcquiringProvider {
  private readonly logger = new Logger(CloudPaymentsGateway.name);
  private readonly client: ClientService;

  constructor(publicId: string, privateKey: string) {
    super();
    this.client = new ClientService({
      publicId: publicId,
      privateKey: privateKey,
    });
  }

  // TEST CARD TOKEN tk_2c74ff1601af6d95d8a0a96ffe94a

  async createOneStageCryptogramPayment(): Promise<any> {
    // const payment = await this.client.getClientApi().chargeCryptogramPayment({
    //   Amount: 1,
    //   CardCryptogramPacket:
    // })
    // const handler = await this.client.getNotificationHandlers();
    // handler.handleCheckRequest()
    return new Promise(() => '');
  }

  async createAuthorizedPaymentMethod(userId: number): Promise<any> {
    const payment = await this.client
      .getClientApi()
      .createOrder({
        Amount: 1,
        email: 'strangemisterio78@gmail.com',
        Currency: 'RUB',
        Description: 'Привязка платежного метода к сервиску GiraffeGo',
        RequireConfirmation: true,
        JsonData: JSON.stringify({
          methodUuid: uuid.v4(),
          userId: userId,
          service: 'payment-method',
        }),
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudCassir payment error!');
      });
    this.logger.log(JSON.stringify(payment));

    if (payment.getResponse().Success === false) {
      throw new BadRequestException('CloudPayment payment error!');
    }

    return payment;
  }

  async createReccurentPayment(
    paymentData: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ): Promise<any> {
    const receipt = this.createReceiptData(paymentData.amount, 'Услуга');

    const payment = await this.client
      .getClientApi()
      .chargeTokenPayment({
        AccountId: paymentMethod.accountId,
        Token: paymentMethod.paymentId,
        Amount: paymentData.amount,
        Currency: 'RUB',
        JsonData: JSON.stringify({
          userId: userId,
          service: 'payment',
          ...receipt,
        }),
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudPayment payment error!');
      });

    this.logger.log(JSON.stringify(payment));

    if (payment.getResponse().Success === false) {
      throw new BadRequestException('CloudPayment payment error!');
    }

    return payment;
  }

  async createTwoStagePayment(
    paymentData: ReccurentPaymentDto,
    userId: number,
    paymentMethod: PaymentMethod,
  ): Promise<any> {
    const receipt = this.createReceiptData(
      paymentData.amount,
      'Залог за поездку',
    );
    const payment = await this.client
      .getClientApi()
      .authorizeTokenPayment({
        AccountId: paymentMethod.accountId,
        Token: paymentMethod.paymentId,
        Amount: paymentData.amount,
        Currency: 'RUB',
        JsonData: JSON.stringify({
          userId: userId,
          service: 'payment',
          ...receipt,
        }),
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudPayment payment error!');
      });
    this.logger.log(JSON.stringify(payment));

    if (payment.getResponse().Success === false) {
      throw new BadRequestException('CloudPayment payment error!');
    }

    return payment;
  }

  async acceptPayment(amount: number, transactionId: number): Promise<any> {
    const payment = await this.client
      .getClientApi()
      .confirmPayment({
        Amount: amount,
        TransactionId: transactionId,
        CultureName: 'ru-RU',
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudPayment payment error!');
      });

    if (payment.getResponse().Success === false) {
      throw new BadRequestException('CloudPayment payment error!');
    }

    return payment;
  }

  async cancelPayment(data: IVoidPaymentData): Promise<any> {
    const payment = await this.client
      .getClientApi()
      .voidPayment({
        TransactionId: data.TransactionId,
        CultureName: 'ru-RU',
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudPayment cancel payment error!');
      });
    this.logger.log(JSON.stringify(payment));

    if (payment.getResponse().Success === false) {
      throw new BadRequestException('CloudPayment cancel payment error!');
    }

    return payment;
  }

  getPaymentStatus(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  confirm3DSecure(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  refundPayments(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async createReceipt(price: number, label: string): Promise<any> {
    const receipt = await this.client
      .getReceiptApi()
      .createReceipt(
        {
          Type: ReceiptTypes.Income,
          AccountId: 'strangemisterio78@gmail.com',
          CultureName: 'ru-RU',
        },
        {
          Items: [
            {
              label: label,
              price: price, //цена
              quantity: 1.0, //количество
              amount: price, //сумма
              vat: 0, //ставка НДС
            },
          ],
        },
      )
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudPayment create receipt error!');
      });
    this.logger.log(JSON.stringify(receipt));
    return receipt;
  }

  private createReceiptData(price: number, label: string) {
    const receipt = {
      items: [
        {
          label: label, //наименование товара
          price: price, //цена
          quantity: 1.0, //количество
          amount: price, //сумма
          vat: 0, //ставка НДС
          method: 0, // тег-1214 признак способа расчета - признак способа расчета
          object: 0, // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
          measurementUnit: 'шт', //единица измерения
        },
      ],
    };
    return {
      CloudPayments: {
        CustomerReceipt: receipt, //онлайн-чек
      },
    };
  }
}
