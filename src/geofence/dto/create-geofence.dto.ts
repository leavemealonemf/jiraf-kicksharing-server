import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateGeofenceDto {
  @ApiProperty({ default: 'Главная' })
  // @IsNotEmpty({
  //   message: 'Поле name не должно быть пустым',
  // })
  name?: string;
  @ApiProperty({ default: 'Сюда приходит json.stringify objects array' })
  coordinates?: string;
  @ApiProperty({ default: 472.848904 })
  radius?: number;

  @ApiProperty({ default: '11:11:11' })
  firtsTimePeriodStart?: string;
  @ApiProperty({ default: '11:11:11' })
  firstTimePeriodEnd?: string;
  @ApiProperty({ default: 5 })
  firstSpeedLimit?: number;
  @ApiProperty({ default: '11:11:11' })
  secondTimePeriodStart?: string;
  @ApiProperty({ default: '11:11:11' })
  secondTimePeriodEnd?: string;
  @ApiProperty({ default: 25 })
  secondSpeedLimit?: number;
  @ApiProperty({ default: 'ул Пушкина 25' })
  address?: string;
  @ApiProperty({ default: 'img src' })
  img?: string;
  @ApiProperty({ default: 5 })
  allTimeSpeedLimit?: number;

  @ApiProperty({ default: 1 })
  @IsNotEmpty({
    message: 'Поле typeId не должно быть пустым',
  })
  typeId: number;
}
