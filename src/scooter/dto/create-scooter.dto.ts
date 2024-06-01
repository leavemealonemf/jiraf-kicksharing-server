import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateScooterDto {
  @ApiProperty({ default: 1 })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  modelId: number;
  @ApiProperty({ default: '1231241324124212' })
  // @IsNotEmpty({
  //   message: 'Поле не должно быть пустым',
  // })
  // serialNumber: string;
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  deviceIMEI: string;
  @ApiProperty({ default: 100 })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  batteryLevel: number;
  @ApiProperty({ default: 'ACTIVE' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  status: $Enums.ScooterStatus;
  @ApiProperty({ default: true })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  power: boolean;
  @ApiProperty({ default: new Date() })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  addedDate: Date;
  @ApiProperty({ default: null })
  photo?: string;

  franchiseId: number;
}
