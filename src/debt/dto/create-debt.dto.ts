import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDebtDto {
  @IsNotEmpty({ message: 'Поле tripUUID не должно быть пустым' })
  @IsString({ message: 'tripUUID: На вход ожидалась строка' })
  @ApiProperty({ default: '356066816141' })
  tripUUID: string;

  @IsNotEmpty({ message: 'Поле price не должно быть пустым' })
  @IsNumber(undefined, { message: 'price: На вход ожидалось число' })
  @ApiProperty({ default: 100.0 })
  price: number;
}
