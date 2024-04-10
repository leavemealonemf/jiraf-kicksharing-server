import { Injectable } from '@nestjs/common';
import { SaveAcquiringMethodDto } from '../dtos';
import {
  SaveBankCardGateway,
  SaveSberbankGateway,
  SaveSbpGateway,
} from './acquiring.save-method.gateway';

@Injectable()
export class AcquiringSaveMethodFabric {
  public getGateway(dto: SaveAcquiringMethodDto) {
    switch (dto.paymentType) {
      case 'bank_card':
        return new SaveBankCardGateway();
      case 'sbp':
        return new SaveSbpGateway();
      case 'sberbank':
        return new SaveSberbankGateway();
      default:
        return null;
    }
  }
}
