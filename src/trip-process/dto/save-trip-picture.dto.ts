import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SaveTripPictureDto {
  @ApiProperty({ default: 'base64 string here' })
  @IsString()
  @IsNotEmpty()
  photo: string;
  @ApiProperty({ default: 12 })
  @IsNumber()
  @IsNotEmpty()
  tripId: number;
}
