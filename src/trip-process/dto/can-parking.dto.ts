import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CanParkingDto {
  @ApiProperty({ default: 55.231412 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;
  @ApiProperty({ default: 55.112312 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
