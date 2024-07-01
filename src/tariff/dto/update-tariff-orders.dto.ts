import { Tariff } from '@prisma/client';

export class UpdateTariffOrdersDto {
  tariffs: Tariff[];
}
