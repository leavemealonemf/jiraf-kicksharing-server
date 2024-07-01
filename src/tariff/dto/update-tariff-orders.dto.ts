import { ApiProperty } from '@nestjs/swagger';
import { Tariff } from '@prisma/client';
import { UpdateTariffDto } from './update-tariff.dto';
import { IsArray } from 'class-validator';

export class UpdateTariffOrdersDto {
  @IsArray({ message: 'На вход ожидался массив tariffs[]' })
  @ApiProperty({ default: [UpdateTariffDto] })
  tariffs: Tariff[];
}
