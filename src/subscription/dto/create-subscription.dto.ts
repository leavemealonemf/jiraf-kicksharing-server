import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ default: 'Новый горизонт' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  name: string;
  @ApiProperty({ default: 200.3 })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  price: number;
}
