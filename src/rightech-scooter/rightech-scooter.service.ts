import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IRightechScooter } from './interfaces';

@Injectable()
export class RightechScooterService {
  private readonly logger = new Logger(RightechScooterService.name);
  baseUrl = null;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.get('RIGHTECH_URL');
  }

  async getAll(): Promise<IRightechScooter[]> {
    const { data } = await axios.get(`${this.baseUrl}/objects`, {
      headers: {
        Authorization: `Bearer ${this.configService.get('RIGHTECH_TOKEN')}`,
      },
    });

    if (!data) {
      throw new Error('Ошибка при получении скутеров от Rightech');
    }

    return data;
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

  async create(deviceId: string) {
    const { data } = await axios.post(
      `${this.baseUrl}/objects`,
      {
        model: '65a92ad40579b79ed8dbd377',
        id: deviceId,
        botEnabled: true,
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get('RIGHTECH_TOKEN')}`,
        },
      },
    );

    if (!data) {
      throw new Error('Ошибка при создании скутера в Rightech');
    }

    return data;
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
