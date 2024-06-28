export abstract class AcquiringProvider {
  abstract createOneStagePayment(): Promise<any>;
  abstract createTwoStagePayment(): Promise<any>;
  abstract acceptPayment(): Promise<any>;
  abstract cancelPayment(): Promise<any>;
  abstract getPaymentStatus(): Promise<any>;
  abstract createReccurentPayment(): Promise<any>;
  abstract confirm3DSecure(): Promise<any>;
  abstract refundPayments(): Promise<any>;
  abstract createReceipt(): Promise<any>;
}
