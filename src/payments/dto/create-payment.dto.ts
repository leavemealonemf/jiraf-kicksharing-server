import { ApiProperty } from '@nestjs/swagger';

enum paymentType {
  CARD = 'bank_card',
  SBP = 'sbp',
  SBERPAY = 'sberbank',
}

export class CreatePaymentDto {
  @ApiProperty({ default: 100 })
  value: number;
  @ApiProperty({ default: paymentType.CARD })
  type: paymentType;
  @ApiProperty({ default: 'Пополнение счета' })
  description: string;
  @ApiProperty({
    default: {
      type: 'BALANCE',
      description: 'Пополнение баланса',
    },
  })
  metadata: {
    type: string;
    description: string;
  };
  @ApiProperty({ default: 1 })
  paymentMethodId: number;
  @ApiProperty({ default: '2d714de3-000f-5000-9000-1edaa76d71fb' })
  paymentMethodStringId: string;
  @ApiProperty({ default: 1 })
  userId: number;
}
