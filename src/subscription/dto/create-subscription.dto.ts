import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ default: 'Новый горизонт' })
  @IsNotEmpty({
    message: 'Поле name не должно быть пустым',
  })
  name: string;
  @ApiProperty({ default: 200.3 })
  @IsNotEmpty({
    message: 'Поле price не должно быть пустым',
  })
  price: number;
  @ApiProperty({ default: 7 })
  @IsNotEmpty({
    message: 'Поле days не должно быть пустым',
  })
  days: number;
}
