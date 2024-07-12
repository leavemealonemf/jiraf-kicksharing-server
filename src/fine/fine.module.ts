import { Module } from '@nestjs/common';
import { FineService } from './fine.service';
import { FineController } from './fine.controller';
import { DbModule } from 'src/db/db.module';
import { AcquiringModule } from 'src/acquiring/acquiring.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { PaymentMethodModule } from 'src/payment-method/payment-method.module';

@Module({
  imports: [DbModule, AcquiringModule, PaymentsModule, PaymentMethodModule],
  controllers: [FineController],
  providers: [FineService],
})
export class FineModule {}
