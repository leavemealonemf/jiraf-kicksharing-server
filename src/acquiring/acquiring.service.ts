import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AcquiringProcessPayment,
  SaveAcquiringMethodGateway,
} from './gateways';
import { AcquiringProcessPaymentDto, SaveAcquiringMethodDto } from './dtos';
import { AcquiringProvider } from './gateways-provider';
import { CloudPaymentsGateway } from './gateways-provider/cloudpayments/cloudpayments-gateway';

@Injectable()
export class AcquiringService {
  private paymentProviderGateway: Record<string, AcquiringProvider> = {};

  private saveAcquiringGateways: Record<string, SaveAcquiringMethodGateway> =
    {};

  constructor(
    private readonly aquiringProcessPayment: AcquiringProcessPayment,
  ) {}

  // Set payment gateway provider (cloudpayments / yookassa)
  public registerPaymentProviderGateway() {
    this.paymentProviderGateway['cloud-payments'] = new CloudPaymentsGateway();
  }

  async createPayment() {
    this.registerPaymentProviderGateway();
    const gateway = this.paymentProviderGateway['cloud-payments'];
    if (!gateway) {
      throw new BadRequestException(
        'Не удалось зарегестрировать cloud-payments gateway',
      );
    }
    return await gateway.createOneStagePayment();
  }

  async createReccurentPayment() {
    this.registerPaymentProviderGateway();
    const gateway = this.paymentProviderGateway['cloud-payments'];
    if (!gateway) {
      throw new BadRequestException(
        'Не удалось зарегестрировать cloud-payments gateway',
      );
    }
    return await gateway.createReccurentPayment();
  }

  async getCloudCassirPaymentInfo(data: any) {
    console.log('pay-info', data);
    console.log('receipt', JSON.parse(data.Data));
  }

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
