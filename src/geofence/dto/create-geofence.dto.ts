import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateGeofenceDto {
  @ApiProperty({ default: 'Главная' })
  @IsNotEmpty({
    message: 'Поле name не должно быть пустым',
  })
  name: string;
  @ApiProperty({ default: 'Сюда приходит json.stringify objects array' })
  coordinates?: string;
  @ApiProperty({ default: 472.848904 })
  radius?: number;
  @ApiProperty({ default: 1 })
  @IsNotEmpty({
    message: 'Поле typeId не должно быть пустым',
  })
  typeId: number;
}
