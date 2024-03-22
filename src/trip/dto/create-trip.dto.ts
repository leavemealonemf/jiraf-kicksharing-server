import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ default: new Date() })
  @IsNotEmpty({
    message: 'Поле startTime не должно быть пустым',
  })
  startTime: Date;
  @ApiProperty({ default: new Date() })
  @IsNotEmpty({
    message: 'Поле endTime не должно быть пустым',
  })
  endTime: Date;
  @ApiProperty({ default: '12:23' })
  @IsNotEmpty({
    message: 'Поле travelTime не должно быть пустым',
  })
  travelTime: string;
  @ApiProperty({ default: 'image src' })
  photo?: string | null;
  @ApiProperty({ default: '200' })
  @IsNotEmpty({
    message: 'Поле price не должно быть пустым',
  })
  price: number;
  @ApiProperty({ default: 2 })
  @IsNotEmpty({
    message: 'Поле userId не должно быть пустым',
  })
  userId: number;
  @ApiProperty({ default: 6 })
  tariffId?: number;
  @ApiProperty({ default: 52 })
  scooterId?: number;
  @ApiProperty({ default: 5 })
  rating?: number;
  @ApiProperty({ default: 1500 })
  distance?: number;
  @ApiProperty({ default: 'JSON LatLon string' })
  coordinates?: string;
}
