import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
  @ApiProperty({ default: 1000 })
  metersToRent: number;
  @ApiProperty({ default: 1500 })
  metersToBooking: number;
}
