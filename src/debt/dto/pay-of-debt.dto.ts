import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PayOfDebtDto {
  @IsNotEmpty({ message: 'Поле tripUUID не должно быть пустым' })
  @IsString({ message: 'tripUUID: На вход ожидалась строка' })
  @ApiProperty({ default: '356066816141' })
  tripUUID: string;
}
