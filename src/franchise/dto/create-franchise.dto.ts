import { ApiProperty } from '@nestjs/swagger';
import { FranchiseWorkStatus } from '@prisma/client';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateFranchiseDto {
  @ApiProperty({ default: 'ИП Яловик Иван Леонидович' })
  @IsNotEmpty({ message: 'Поле organization не должно быть пустым' })
  @IsString({ message: 'На вход ожидалась строка' })
  organization: string;

  @ApiProperty({ default: '554433321232' })
  @IsString({ message: 'На вход ожидалась строка' })
  taxpayerIdNumber?: string;

  @ApiProperty({
    default: '302019, Орловская область, г. Орёл, ул. Ленина, д3, кв152',
  })
  @IsNotEmpty({ message: 'Поле legalAddress не должно быть пустым' })
  @IsString({ message: 'На вход ожидалась строка' })
  legalAddress: string;

  @ApiProperty({
    default: '3214123123143123',
  })
  @IsNotEmpty({ message: 'Поле youKassaAccount не должно быть пустым' })
  @IsString({ message: 'На вход ожидалась строка' })
  youKassaAccount: string;

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
