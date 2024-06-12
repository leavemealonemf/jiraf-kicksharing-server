import { BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';

export abstract class FlashCallGateway {
  abstract sendCode(number: string): Promise<any>;
}

export class StreamTelecomFlashCallGateway extends FlashCallGateway {
  private readonly logger = new Logger(StreamTelecomFlashCallGateway.name);

  async sendCode(number: string): Promise<any> {
    try {
      this.logger.log('Отправили сброс-звонок');
      const { data } = await axios.get(
        `https://gateway.api.sc/flash/?login=79606425333&pass=08NX{a[xzs&type=flash&code_gen=true&phone=${number}`,
      );
      return data.code;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        `Не удалось сделать сброс-звонок StreamTelecomFlashCallGateway`,
      );
    }
  }
}
