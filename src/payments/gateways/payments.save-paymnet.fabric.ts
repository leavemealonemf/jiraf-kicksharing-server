import { Injectable } from '@nestjs/common';
import { ReccurentPaymentDto } from 'src/acquiring/dtos';
import {
  SaveBalancePayment,
  SaveDebtPayment,
  SaveFinePayment,
  SaveSubscriptionPayment,
  SaveTripPayment,
} from './payments.save-payment.gateway';

@Injectable()
export class SavePaymentFabric {
  public getGateway(dto: ReccurentPaymentDto) {
    switch (dto.metadata.type) {
      case 'BALANCE':
        return new SaveBalancePayment();
      case 'SUBSCRIPTION':
        return new SaveSubscriptionPayment();
      case 'TRIP':
        return new SaveTripPayment();
      case 'DEBT':
        return new SaveDebtPayment();
      case 'FINE':
        return new SaveFinePayment();
      default:
        return null;
    }
  }
}
