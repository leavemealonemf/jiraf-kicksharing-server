import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

type PAYMENT_TYPE = 'BALANCE' | 'TRIP' | 'SUBSCRIPTION';

class ReccurentPaymentMetadataDto {
  @ApiProperty({ default: 'BALANCE' })
  type: PAYMENT_TYPE;
  @ApiProperty({ default: 'Промокод "Юзаю!"' })
  description: string;
}

export class ReccurentPaymentDto {
  @ApiProperty({ default: 100 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ default: ReccurentPaymentMetadataDto })
  metadata: ReccurentPaymentMetadataDto;
}
