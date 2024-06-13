import { BadRequestException, Logger } from '@nestjs/common';
import { AcquiringProvider } from '../base';
import { ClientService } from 'cloudpayments';
import * as uuid from 'uuid';

export class CloudPaymentsGateway extends AcquiringProvider {
  private readonly logger = new Logger(CloudPaymentsGateway.name);
  private readonly client = new ClientService({
    publicId: 'pk_42204cdc701ea748b587162053789',
    privateKey: 'e35b382e426a29b928ce49a435a93f90',
  });

  async createOneStagePayment(): Promise<any> {
    const payment = await this.client
      .getClientApi()
      .createOrder({
        Amount: 1,
        Currency: 'RUB',
        Description: 'Привязка платежного метода к сервиску GiraffeGo',
      })
      .catch((err) => {
        this.logger.error(err);
        throw new BadRequestException('CloudCassir payment error!');
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
  cancelPayment(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getPaymentStatus(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
