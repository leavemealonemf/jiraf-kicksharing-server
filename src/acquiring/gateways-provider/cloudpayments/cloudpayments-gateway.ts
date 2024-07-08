import { BadRequestException, Logger } from '@nestjs/common';
import { AcquiringProvider } from '../base';
import { ClientService, ReceiptTypes } from 'cloudpayments';
import { IVoidPaymentData } from './interfaces';
import * as uuid from 'uuid';

export class CloudPaymentsGateway extends AcquiringProvider {
  private readonly logger = new Logger(CloudPaymentsGateway.name);
  private readonly client = new ClientService({
    publicId: 'pk_42204cdc701ea748b587162053789',
    privateKey: 'e35b382e426a29b928ce49a435a93f90',
  });

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
          userId: userId ? userId : 1,
          service: 'payment-method',
        }),
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudCassir payment error!');
      });
    this.logger.log(JSON.stringify(payment));
    return payment;
  }

  async createReccurentPayment(): Promise<any> {
    const receipt = this.createReceiptData();

    const payment = await this.client
      .getClientApi()
      .chargeTokenPayment({
        AccountId: 'strangemisterio78@gmail.com',
        Token: 'tk_bdbf138c096255437259d75e6289a',
        Amount: 150,
        Currency: 'RUB',
        JsonData: JSON.stringify(receipt),
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudPayment payment error!');
      });
    this.logger.log(JSON.stringify(payment));
    return payment;
  }

  createTwoStagePayment(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  acceptPayment(): Promise<any> {
    throw new Error('Method not implemented.');
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
  async createReceipt(): Promise<any> {
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
              label: 'Поездка на самокате', //наименование товара
              price: 100.0, //цена
              quantity: 1.0, //количество
              amount: 100.0, //сумма
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

  private createReceiptData() {
    const receipt = {
      items: [
        {
          label: 'Поездка на самокате', //наименование товара
          price: 100.0, //цена
          quantity: 1.0, //количество
          amount: 100.0, //сумма
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
