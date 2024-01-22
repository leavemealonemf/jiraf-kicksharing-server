import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class RightechScooterService {
  baseUrl = null;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.get('RIGHTECH_URL');
  }

  async getAll() {
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
