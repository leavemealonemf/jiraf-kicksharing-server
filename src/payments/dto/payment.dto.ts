import { $Enums } from '@prisma/client';

export class PaymentDto {
  service: $Enums.PaymentService;
  type: $Enums.PaymentType;
  status: $Enums.PaymentStatus;
  description: string;
  paymentMethodId: number;
}
