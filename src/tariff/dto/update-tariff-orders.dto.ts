import { ApiProperty } from '@nestjs/swagger';
import { Tariff } from '@prisma/client';
import { IsArray } from 'class-validator';

export class UpdateTariffOrdersDto {
  @IsArray({ message: 'На вход ожидался массив tariffs[]' })
  @ApiProperty({ default: 'НЕ ТРОГАТЬ ДАННУЮ РУЧКУ! ЗАПРОС СТРОГО С КЛИЕНТА' })
  tariffs: Tariff[];
}
