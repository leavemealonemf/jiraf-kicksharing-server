import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateErpUserDto {
  @ApiProperty({ default: 'Jack' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  name: string;
  @ApiProperty({ default: '+79202475351' })
  phone: string;
  @ApiProperty({ default: 'jackminijack@ya.ru' })
  @IsEmail({}, { message: 'Поле должно быть типа email' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  email: string;
  @ApiProperty({ default: 'ADMIN' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  role: $Enums.ErpUserRoles;
  inviterId?: number;
}
