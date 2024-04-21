import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TestGeofencingDto {
  @ApiProperty({ default: 12 })
  @IsNumber()
  lat: number;
  @ApiProperty({ default: 12 })
  @IsNumber()
  lon: number;
}
