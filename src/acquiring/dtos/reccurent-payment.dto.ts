import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

type PAYMENT_TYPE =
  | 'BALANCE'
  | 'TRIP'
  | 'SUBSCRIPTION'
  | 'DEBT'
  | 'FINE'
  | 'PLEDGE';

type ReceiptType = PAYMENT_TYPE;

export class CustomReceiptData {
  receiptType: ReceiptType;
  servicePrice?: number;
  tripStartPrice?: number;
  tripDurationInMinutes?: number;
  tripTotalPriceWithoutStart?: number;
  tripOneMinutePrice?: number;
  isBonusesUsed?: boolean;
  bonusesPaid?: number;
}

class ReccurentPaymentMetadataDto {
  @ApiProperty({ default: 'BALANCE' })
  type: PAYMENT_TYPE;
  @ApiProperty({ default: 'Промокод "Юзаю!"' })
  description: string;
  isReceiptIncludes?: boolean;
  receiptData?: CustomReceiptData;
}

export class ReccurentPaymentDto {
  @ApiProperty({ default: 100 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ default: ReccurentPaymentMetadataDto })
  metadata: ReccurentPaymentMetadataDto;
}
