import { ApiProperty } from '@nestjs/swagger';

export class SaveCoordinatesDto {
  @ApiProperty({ default: 12 })
  tripId: number;
  @ApiProperty({ default: [55.75393, 37.620795] })
  latLon: number[];
}
