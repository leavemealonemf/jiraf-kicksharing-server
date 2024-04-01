import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class EndTripProcessDto {
  @ApiProperty({ default: 3 })
  @IsNumber()
  @IsNotEmpty()
  tripId: number;
  @ApiProperty({ default: 'JSON LatLon' })
  coordinates?: string;
}
