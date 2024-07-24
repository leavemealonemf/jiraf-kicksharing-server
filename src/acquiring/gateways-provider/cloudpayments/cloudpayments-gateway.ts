import { BadRequestException, Logger } from '@nestjs/common';
import { AcquiringProvider } from '../base';
import { ClientService, ReceiptTypes } from 'cloudpayments';
import { IVoidPaymentData } from './interfaces';
import * as uuid from 'uuid';
import { ReccurentPaymentDto } from 'src/acquiring/dtos';
import { PaymentMethod, User } from '@prisma/client';
import { formatPhoneNumber } from '@common/utils';

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

  async createAuthorizedPaymentMethod(dbUser: User): Promise<any> {
    const payment = await this.client
      .getClientApi()
      .createOrder({
        Amount: 10,
        AccountId: dbUser.clientId,
        Currency: 'RUB',
        Description: 'Добваление карты к сервису GiraffeGo',
        RequireConfirmation: true,
        JsonData: JSON.stringify({
          methodUuid: uuid.v4(),
          userId: dbUser.id,
          service: 'payment-method',
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

  async createReccurentPayment(
    paymentData: ReccurentPaymentDto,
    userId: number,
    phone: string,
    paymentMethod: PaymentMethod,
  ): Promise<any> {
    const receipt = this.createReceiptData(paymentData);
    const payerPhoneNumber = formatPhoneNumber(phone);

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
        Payer: {
          Phone: payerPhoneNumber,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudPayment payment error!');
      });

    this.logger.log(JSON.stringify(payment));

    if (payment.getResponse().Success === false) {
      throw new BadRequestException('Ошибка. На карте недостаточно средств');
    }

    return payment;
  }

  async createTwoStagePayment(
    paymentData: ReccurentPaymentDto,
    userId: number,
    phone: string,
    paymentMethod: PaymentMethod,
  ): Promise<any> {
    const receipt = this.createReceiptData(paymentData);
    const payerPhoneNumber = formatPhoneNumber(phone);

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
        Payer: {
          Phone: payerPhoneNumber,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudPayment payment error!');
      });
    this.logger.log(JSON.stringify(payment));

    if (payment.getResponse().Success === false) {
      throw new BadRequestException('Ошибка. На карте недостаточно средств');
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

  private createReceiptData(paymentData: ReccurentPaymentDto) {
    const receipt = this.createReceiptFabric(paymentData);
    return {
      CloudPayments: {
        CustomerReceipt: receipt, //онлайн-чек
      },
    };
  }

  private createReceiptFabric(paymentData: ReccurentPaymentDto) {
    switch (paymentData.metadata.receiptData.receiptType) {
      case 'TRIP':
        return {
          items: [
            {
              label: 'Старт поездки', //наименование товара
              price: paymentData.metadata.receiptData.tripStartPrice, //цена
              quantity: 1.0, //количество
              amount: paymentData.metadata.receiptData.tripStartPrice, //сумма
              vat: 0, //ставка НДС
              method: 0, // тег-1214 признак способа расчета - признак способа расчета
              object: 0, // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
              measurementUnit: 'Шт.', //единица измерения
            },
            {
              label: 'Поминутный тариф', //наименование товара
              price:
                paymentData.metadata.receiptData.tripOneMinutePrice.toFixed(2), //цена
              quantity: paymentData.metadata.receiptData.tripDurationInMinutes, //количество
              amount:
                paymentData.metadata.receiptData.tripTotalPriceWithoutStart.toFixed(
                  2,
                ), //сумма
              vat: 0, //ставка НДС
              method: 0, // тег-1214 признак способа расчета - признак способа расчета
              object: 0, // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
              measurementUnit: 'Мин.', //единица измерения
            },
            // {
            //   label: 'Бонусы', //наименование товара
            //   price: paymentData.metadata.receiptData.bonusesPaid, //цена
            //   quantity: paymentData.metadata.receiptData.isBonusesUsed ? 1 : 0, //количество
            //   amount: paymentData.metadata.receiptData.bonusesPaid, //сумма
            //   vat: 0, //ставка НДС
            //   method: 0, // тег-1214 признак способа расчета - признак способа расчета
            //   object: 0, // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
            //   measurementUnit: 'Шт.', //единица измерения
            // },
          ],
          // email: 'strangemisterio78@gmail.com',
        };
      case 'SUBSCRIPTION':
        break;
      case 'PLEDGE':
        return {
          items: [
            {
              label: 'Залог за поездку', //наименование товара
              price: 300, //цена
              quantity: 1.0, //количество
              amount: 300, //сумма
              vat: 0, //ставка НДС
              method: 0, // тег-1214 признак способа расчета - признак способа расчета
              object: 0, // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
              measurementUnit: 'Шт.', //единица измерения
            },
          ],
        };
      default:
        break;
    }
  }
}
