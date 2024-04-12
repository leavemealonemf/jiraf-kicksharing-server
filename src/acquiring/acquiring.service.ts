import { Injectable } from '@nestjs/common';
import {
  AcquiringProcessPayment,
  SaveAcquiringMethodGateway,
} from './gateways';
import { AcquiringProcessPaymentDto, SaveAcquiringMethodDto } from './dtos';

@Injectable()
export class AcquiringService {
  private saveAcquiringGateways: Record<string, SaveAcquiringMethodGateway> =
    {};

  constructor(
    private readonly aquiringProcessPayment: AcquiringProcessPayment,
  ) {}

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

  async processPayment(dto: AcquiringProcessPaymentDto) {
    return await this.aquiringProcessPayment.processPayment(dto);
  }

  async processPaymentTwoSteps(dto: AcquiringProcessPaymentDto) {
    return await this.aquiringProcessPayment.processPaymentTwoSteps(dto);
  }

  async cancelPayment(paymentId: string) {
    return await this.aquiringProcessPayment.cancelProcessPayment(paymentId);
  }
}
