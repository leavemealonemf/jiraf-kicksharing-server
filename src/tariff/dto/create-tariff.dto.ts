import { ApiProperty } from '@nestjs/swagger';
import { TariffStatus } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateTariffDto {
  @ApiProperty({ default: 'С ветерком' })
  @IsNotEmpty({
    message: 'Поле name не должно быть пустым',
  })
  name: string;
  @ApiProperty({ default: 50 })
  @IsNotEmpty({
    message: 'Поле boardingCost не должно быть пустым',
  })
  boardingCost: number;
  @ApiProperty({ default: 5 })
  @IsNotEmpty({
    message: 'Поле minuteCost не должно быть пустым',
  })
  minuteCost: number;
  @ApiProperty({ default: 25 })
  @IsNotEmpty({
    message: 'Поле pauseCost не должно быть пустым',
  })
  pauseCost: number;
  @ApiProperty({ default: 10 })
  fixedCost?: number;
  @ApiProperty({ default: 100 })
  @IsNotEmpty({
    message: 'Поле reservationCost не должно быть пустым',
  })
  reservationCost: number;
  @ApiProperty({ default: '#000000' })
  @IsNotEmpty({
    message: 'Поле colorHex не должно быть пустым',
  })
  colorHex: string;
  @ApiProperty({ default: TariffStatus.ACTIVE })
  @IsNotEmpty({
    message: 'Поле status не должно быть пустым',
  })
  status: TariffStatus;
}
