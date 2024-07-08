export interface IPaymentJsonData {
  methodUuid: string;
  userId: number;
  service: PaymentJsonDataServices;
}

export type PaymentJsonDataServices = 'payment-method' | 'payment';
