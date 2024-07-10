import { Injectable } from '@nestjs/common';
import { ReccurentPaymentDto } from 'src/acquiring/dtos';
import {
  SaveBalancePayment,
  // SaveSubscriptionPayment,
  SaveTripPayment,
} from './payments.save-payment.gateway';

@Injectable()
export class SavePaymentFabric {
  public getGateway(dto: ReccurentPaymentDto) {
    switch (dto.metadata.type) {
      case 'BALANCE':
        return new SaveBalancePayment();
      // case 'SUBSCRIPTION':
      //   return new SaveSubscriptionPayment();
      case 'TRIP':
        return new SaveTripPayment();
      default:
        return null;
    }
  }
}
