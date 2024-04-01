import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StartTripProcessDto {
  @ApiProperty({ default: '231245' })
  @IsString()
  @IsNotEmpty()
  scooterId: string;
  @ApiProperty({ default: 1 })
  @IsNumber()
  @IsNotEmpty()
  tariffId: number;
}
