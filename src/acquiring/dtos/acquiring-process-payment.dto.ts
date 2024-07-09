import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum paymentType {
  CARD = 'bank_card',
  SBP = 'sbp',
  SBERPAY = 'sberbank',
}

export type AcquiringProcessPaymentMetadataServiceType =
  | 'BALANCE'
  | 'TRIP'
  | 'SUBSCRIPTION';

export enum AcquiringProcessPaymentMetadataServiceEnum {
  BALANCE = 'BALANCE',
  TRIP = 'TRIP',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export type AcquiringProcessPaymentMetadataOperationType =
  | 'REPLACEMENT'
  | 'WRITEOFF';

export class AcquiringProcessPaymentDto {
  @ApiProperty({ default: 100 })
  @IsNumber(undefined, { message: 'value - Ошибка. Ожидалось число' })
  value: number;

  @ApiProperty({ default: paymentType.CARD })
  @IsNotEmpty({ message: 'Поле type не должно быть пустым' })
  type: paymentType;

  @ApiProperty({ default: 'Пополнение счета' })
  @IsNotEmpty({ message: 'Поле description не должно быть пустым' })
  description: string;

  @ApiProperty({
    default: {
      type: 'BALANCE',
      description: 'Пополнение баланса',
    },
  })
  metadata: {
    type: AcquiringProcessPaymentMetadataServiceType;
    description: string;
    tripBonusesUsed?: number;
  };

  @ApiProperty({ default: 1 })
  @IsNumber(undefined, { message: 'paymentMethodId - Ошибка. Ожидалось число' })
  @IsNotEmpty({ message: 'Поле не должно быть пустым' })
  paymentMethodId: number;

  @ApiProperty({ default: '2d714de3-000f-5000-9000-1edaa76d71fb' })
  @IsNotEmpty({ message: 'Поле paymentMethodStringId не должно быть пустым' })
  @IsString({ message: 'paymentMethodStringId - Ошибка. Ожидалась строка' })
  paymentMethodStringId: string;
}
