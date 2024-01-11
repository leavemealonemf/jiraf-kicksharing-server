import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateErpUserDto {
  @ApiProperty({ default: 'Jack' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  name: string;
  @ApiProperty({ default: '+79202475351' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  phone: string;
  @ApiProperty({ default: 'jackminijack@ya.ru' })
  @IsEmail({}, { message: 'Поле должно быть типа email' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  email: string;
  @ApiProperty({ default: '123gensalt123' })
  @MinLength(8, {
    message: 'Ошибка. Пароль должен содержать минимум 8 символов',
  })
  password: string;
  franchiseId?: number;
}
