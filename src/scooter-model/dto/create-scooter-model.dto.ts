import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateScooterModelDto {
  @ApiProperty({ default: 'Ninebot Max Plus' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  modelName: string;
  @ApiProperty({ default: 50 })
  @IsNumber()
  chargeReserve?: number;
}
