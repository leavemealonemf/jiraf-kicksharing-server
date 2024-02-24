import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ default: '+79606425333' })
  @IsNotEmpty({
    message: 'Поле phone не должно быть пустым',
  })
  phone: string;
}
