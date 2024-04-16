import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ICommandHandler {
  sendCommand(objectId: string, command: string): Promise<any>;
}

export class ScooterCommandHandler implements ICommandHandler {
  private readonly configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }

  async sendCommand(objectId: string, command: string): Promise<any> {
    try {
      const url = this.configService.get('RIGHTECH_URL');

      const { data } = await axios.post(
        `${url}/objects/${objectId}/commands/${command}`,
        undefined,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('RIGHTECH_TOKEN')}`,
          },
        },
      );
      return data;
    } catch (error) {
      throw new Error('IoT send scooter command Error');
    }
  }
}
