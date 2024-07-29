import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TerminateTripDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ default: 'aacc231grbe12' })
  userUUID: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ default: 231 })
  tripId: number;
}
