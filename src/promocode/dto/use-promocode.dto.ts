import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class UsePromocodeDto {
  @ApiProperty({ default: 'START' })
  @IsString({ message: 'Ошибка, на вход ожидалась строка' })
  @IsNotEmpty({ message: 'Поле code не должно быть пустым' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value?.trim() : value,
  )
  code: string;
}
