import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const config = new ConfigService();

export async function getScooterPackets(
  objectId: string,
  from: string,
  to: string,
) {
  try {
    const url = config.get('RIGHTECH_URL');

    const res = await axios.get(
      `${url}/objects/${objectId}/packets?from=${from}&to=${to}`,
      {
        headers: {
          Authorization: `Bearer ${config.get('RIGHTECH_TOKEN')}`,
        },
      },
    );

    return res.data;
  } catch (error) {
    throw new Error(
      'Не удалось получить пакеты на определенный промежуток времени',
    );
  }
}
