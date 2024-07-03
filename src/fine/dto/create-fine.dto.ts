import { ApiProperty } from '@nestjs/swagger';
import { DeviceType, FineReason } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFineDto {
  @IsNotEmpty({ message: 'Поле tripUUID не должно быть пустым' })
  @IsString({ message: 'tripUUID: На вход ожидалась строка' })
  @ApiProperty({ default: '356066816141' })
  tripUUID: string;

  @IsNotEmpty({ message: 'Поле deviceType не должно быть пустым' })
  @ApiProperty({ default: DeviceType.SCOOTER })
  deviceType: DeviceType;

  @IsNotEmpty({ message: 'Поле causeType не должно быть пустым' })
  @ApiProperty({ default: FineReason.DAMAGE })
  causeType: FineReason;

  @IsNotEmpty({ message: 'Поле description не должно быть пустым' })
  @IsString({ message: 'description: На вход ожидалась строка' })
  @ApiProperty({ default: 'Сломано крыло самоката' })
  description: string;

  @ApiProperty({
    default:
      'Массив base64 изображений (НЕ ИСПОЛЬЗОВАТЬ ЧТО-ТО КРОМЕ base64). Можно пропустить',
  })
  photos: string[];

  @IsNotEmpty({ message: 'Поле price не должно быть пустым' })
  @IsNumber(undefined, { message: 'price: Ожидалось число' })
  @ApiProperty({ default: 1500 })
  price: number;
}
