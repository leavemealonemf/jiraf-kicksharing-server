import { ApiProperty } from '@nestjs/swagger';

export class UpdateSubscriptionOptionsDto {
  @ApiProperty({ default: true })
  autoPayment?: boolean;
}
