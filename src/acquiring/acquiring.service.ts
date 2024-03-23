import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SaveAcquiringMethodGateway } from './gateways';
import { SaveAcquiringMethodDto } from './dtos';

@Injectable()
export class AcquiringService {
  private saveAcquiringGateways: Record<string, SaveAcquiringMethodGateway> =
    {};

  constructor(private readonly configService: ConfigService) {}

  public rigisterSaveAcquiringGateway(
    dto: SaveAcquiringMethodDto,
    gateway: SaveAcquiringMethodGateway,
  ) {
    this.saveAcquiringGateways[dto.paymentType] = gateway;
  }

  async saveAcquiringMethod(dto: SaveAcquiringMethodDto) {
    const gateway = this.saveAcquiringGateways[dto.paymentType];
    if (!gateway) {
      throw new Error('Невозможно сохранить данный платежный метод');
    }
    return await gateway.saveAcquiringMethodProcess(dto);
  }
}
