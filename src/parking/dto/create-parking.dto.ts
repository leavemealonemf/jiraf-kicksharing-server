import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParkingDto {
  @ApiProperty({ default: 'ул Пушкина' })
  address?: string;
  photo?: string;
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  @ApiProperty({ default: 55.73255 })
  latitude: number;
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  @ApiProperty({ default: 37.685518 })
  longitude: number;
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  @ApiProperty({ default: 20 })
  radius: number;
}
