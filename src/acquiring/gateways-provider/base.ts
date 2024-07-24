export abstract class AcquiringProvider {
  abstract createOneStageCryptogramPayment(): Promise<any>;
  abstract createAuthorizedPaymentMethod(user: any): Promise<any>;
  abstract createTwoStagePayment(
    paymentData: any,
    userId: number,
    phone: string,
    paymentMethod: any,
  ): Promise<any>;
  abstract acceptPayment(amount: number, transactionId: number): Promise<any>;
  abstract cancelPayment(data: any): Promise<any>;
  abstract getPaymentStatus(): Promise<any>;
  abstract createReccurentPayment(
    paymentData: any,
    userId: number,
    phone: string,
    paymentMethod: any,
  ): Promise<any>;
  abstract confirm3DSecure(): Promise<any>;
  abstract refundPayments(): Promise<any>;
  abstract createReceipt(price: number, label: string): Promise<any>;
}
