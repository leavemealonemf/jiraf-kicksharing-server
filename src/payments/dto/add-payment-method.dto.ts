import { ApiProperty } from '@nestjs/swagger';
// import { $Enums } from '@prisma/client';

export class AddPaymentMethodDto {
  @ApiProperty({ default: 1 })
  userId: number;
  //   @ApiProperty({ default: $Enums.PaymentMethodType.CARD })
  //   type: $Enums.PaymentMethodType;
}
