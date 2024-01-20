import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ default: 'jackminijack@ya.ru' })
  @IsEmail({}, { message: 'Поле должно быть типа email' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  email: string;
  @ApiProperty({ default: '123gensalt123' })
  password: string;
}
