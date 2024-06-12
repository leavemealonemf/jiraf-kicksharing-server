import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { FlashCallGateway, StreamTelecomFlashCallGateway } from './gateway';

@Injectable()
export class FlashCallService {
  private readonly logger = new Logger(FlashCallService.name);
  private flashCallGateways: Record<string, FlashCallGateway> = {};

  private registerFlashCallGateway(
    flashCallProvider: string = 'stream-telecom',
    gateway: FlashCallGateway = new StreamTelecomFlashCallGateway(),
  ) {
    this.flashCallGateways[flashCallProvider] = gateway;
  }

  async sendCode(number: string) {
    this.registerFlashCallGateway();
    const gateway = this.flashCallGateways['stream-telecom'];
    if (!gateway) {
      throw new BadRequestException(
        'Не удалось зарегистрировать FlashCall gateway',
      );
    }
    const res = await gateway.sendCode(number);
    return Number(res);
  }
}
