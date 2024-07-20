import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IRightechScooter } from './interfaces';

const MODELS_IOT = {
  models: {
    arnavi3: {
      modelID: '6665afbe3cf021e5df25c9bd',
    },
    teltonika: {
      modelID: '661b0ed4b5ee4df6483c0a12',
    },
  },
};

@Injectable()
export class RightechScooterService {
  private readonly logger = new Logger(RightechScooterService.name);
  baseUrl = null;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.get('RIGHTECH_URL');
  }

  async getAll(): Promise<IRightechScooter[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/objects`, {
        headers: {
          Authorization: `Bearer ${this.configService.get('RIGHTECH_TOKEN')}`,
        },
      });

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async getOne(id: string): Promise<IRightechScooter> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/objects/${id}`, {
        headers: {
          Authorization: `Bearer ${this.configService.get('RIGHTECH_TOKEN')}`,
        },
      });
      return data;
    } catch (err) {
      this.logger.error(err);
      throw new NotFoundException(
        `Не удалось получить скутер от Rightech c id: ${id}`,
      );
    }
  }

  async create(deviceIMEI: string) {
    try {
      const deviceOnlyIMEI = deviceIMEI.split(':')[1];

      const { data } = await axios.post(
        `${this.baseUrl}/objects`,
        {
          model: MODELS_IOT.models[deviceOnlyIMEI].modelID,
          id: deviceIMEI,
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('RIGHTECH_TOKEN')}`,
          },
        },
      );

      return data;
    } catch (error) {
      throw new Error('Ошибка при создании скутера в Rightech');
    }
  }

  async delete(id: string) {
    const res = await axios.delete(`${this.baseUrl}/objects/${id}`, {
      headers: {
        Authorization: `Bearer ${this.configService.get('RIGHTECH_TOKEN')}`,
      },
      data: {
        dryRun: false,
        confirm: true,
      },
    });

    return res;
  }
}
