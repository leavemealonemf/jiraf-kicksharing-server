enum paymentType {
  CARD = 'bank_card',
  SBP = 'sbp',
  SBERPAY = 'sberbank',
}

export class CreatePaymentDto {
  value: number;
  type: paymentType;
}
