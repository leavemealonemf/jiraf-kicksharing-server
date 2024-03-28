import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConfirmAuthMobile {
  @ApiProperty({ default: 4455 })
  @IsNumber(undefined, { message: 'Ошибка. Ожидалось число' })
  @IsNotEmpty({ message: 'Поле не может быть пустым' })
  //   @MaxLength(4, { message: 'Код не может быть более 4-ех значений' })
  code: number;
}
