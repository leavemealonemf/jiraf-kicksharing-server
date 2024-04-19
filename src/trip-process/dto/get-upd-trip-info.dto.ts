import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUpdatedTripInfoDto {
  @ApiProperty({ default: 'a12312fegbre12' })
  @IsString()
  @IsNotEmpty()
  tripUUID: string;
}
