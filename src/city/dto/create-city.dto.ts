import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ default: 'Орел' })
  @IsNotEmpty({ message: 'Поле name не должно быть пустым' })
  @IsString({ message: 'На вход ожидалась строка' })
  name: string;

  @ApiProperty({ default: 'Орловская область' })
  @IsNotEmpty({ message: 'Поле subject не должно быть пустым' })
  @IsString({ message: 'На вход ожидалась строка' })
  subject: string;

  @ApiProperty({ default: 53.45 })
  @IsNotEmpty({ message: 'Поле lat не должно быть пустым' })
  @IsNumber(undefined, { message: 'На вход ожидалось число' })
  lat: number;

  @ApiProperty({ default: 36 })
  @IsNotEmpty({ message: 'Поле lng не должно быть пустым' })
  @IsNumber(undefined, { message: 'На вход ожидалось число' })
  lng: number;
}
