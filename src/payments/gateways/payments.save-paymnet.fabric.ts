import { Injectable } from '@nestjs/common';
import { AcquiringProcessPaymentDto } from 'src/acquiring/dtos';
import {
  SaveBalancePayment,
  SaveSubscriptionPayment,
} from './payments.save-payment.gateway';

@Injectable()
export class SavePaymentFabric {
  public getGateway(dto: AcquiringProcessPaymentDto) {
    switch (dto.metadata.type) {
      case 'BALANCE':
        return new SaveBalancePayment();
      case 'SUBSCRIPTION':
        return new SaveSubscriptionPayment();
      default:
        return null;
    }
  }
}
