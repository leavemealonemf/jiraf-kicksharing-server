import { ApiProperty } from '@nestjs/swagger';
import { FranchiseWorkStatus } from '@prisma/client';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateFranchiseDto {
  @ApiProperty({ default: 'ИП Яловик Иван Леонидович' })
  @IsNotEmpty({ message: 'Поле franchiseName не должно быть пустым' })
  @IsString({ message: 'На вход ожидалась строка' })
  franchiseName: string;

  @ApiProperty({ default: 392.23 })
  @IsNotEmpty({ message: 'Поле priceForScooterMonth не должно быть пустым' })
  @IsNumber(undefined, { message: 'На вход ожидалось число' })
  priceForScooterMonth: number;

  @ApiProperty({ default: 'WORK' })
  @IsNotEmpty({ message: 'Поле workStatus не должно быть пустым' })
  workStatus: FranchiseWorkStatus;

  @ApiProperty({ default: 1 })
  @IsNotEmpty({ message: 'Поле cityId не должно быть пустым' })
  @IsNumber(undefined, { message: 'На вход ожидалось число' })
  cityId: number;
}
