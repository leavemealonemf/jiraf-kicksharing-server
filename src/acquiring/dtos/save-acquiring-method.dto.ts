import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export type AcquiringPaymentType = 'bank_card' | 'sberbank' | 'sbp';

export class SaveAcquiringMethodDto {
  @ApiProperty({ default: 'bank_card' })
  @IsString({ message: 'Ошибка. На вход ожидалась строка' })
  @IsNotEmpty({ message: 'Поле не должно быть пустым' })
  paymentType: AcquiringPaymentType;
}
