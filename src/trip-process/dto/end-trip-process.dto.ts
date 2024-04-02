import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EndTripProcessDto {
  @ApiProperty({ default: 3 })
  @IsNumber()
  @IsNotEmpty()
  tripId: number;
  @ApiProperty({ default: 'JSON LatLon' })
  coordinates?: string;
  @ApiProperty({ default: 'a12312fegbre12' })
  @IsString()
  @IsNotEmpty()
  tripUUID: string;
}
