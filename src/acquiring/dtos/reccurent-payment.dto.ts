import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

type PAYMENT_TYPE = 'BALANCE' | 'TRIP' | 'SUBSCRIPTION' | 'DEBT' | 'FINE';

type ReceiptType = 'TRIP' | 'SUBSCRIPTION';

class CustomReceiptData {
  receiptType: ReceiptType;
  tripStartPrice: number;
  tripDurationInMinutes: number;
  tripTotalPriceWithoutStart: number;
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
