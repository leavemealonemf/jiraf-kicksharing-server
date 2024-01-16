import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateScooterModelDto {
  @ApiProperty({ default: 'Ninebot Max Plus' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  modelName: string;
}
