import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateScooterDto {
  @ApiProperty({ default: 'Ninebot Max Plus' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  modelName: string;
  @ApiProperty({ default: '1231241324124212' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  serialNumber: string;
  @ApiProperty({ default: 1 })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  franchiseId: number;
  @ApiProperty({ default: 100 })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  batteryLevel: number;
  @ApiProperty({ default: 'NOTRENTED' })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  status: $Enums.ScooterStatus;
  @ApiProperty({ default: true })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  active: boolean;
  @ApiProperty({ default: new Date() })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  addedDate: Date;
  @ApiProperty({ default: null })
  photo?: string;
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  @ApiProperty({ default: 3 })
  @IsNotEmpty({
    message: 'Поле не должно быть пустым',
  })
  parkingId: number;
}
