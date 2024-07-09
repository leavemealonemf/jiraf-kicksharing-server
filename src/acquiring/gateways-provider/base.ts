export abstract class AcquiringProvider {
  abstract createOneStageCryptogramPayment(): Promise<any>;
  abstract createAuthorizedPaymentMethod(userId: number): Promise<any>;
  abstract createTwoStagePayment(): Promise<any>;
  abstract acceptPayment(): Promise<any>;
  abstract cancelPayment(data: any): Promise<any>;
  abstract getPaymentStatus(): Promise<any>;
  abstract createReccurentPayment(
    paymentData: any,
    userId: number,
    paymentMethod: any,
  ): Promise<any>;
  abstract confirm3DSecure(): Promise<any>;
  abstract refundPayments(): Promise<any>;
  abstract createReceipt(): Promise<any>;
}
