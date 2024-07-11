import { Module } from '@nestjs/common';
import { AcquiringService } from './acquiring.service';
import { AcquiringController } from './acquiring.controller';
import { AcquiringProcessPayment, AcquiringSaveMethodFabric } from './gateways';
import { PaymentsModule } from 'src/payments/payments.module';
import { PaymentMethodModule } from 'src/payment-method/payment-method.module';
import { FranchiseModule } from 'src/franchise/franchise.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [PaymentsModule, PaymentMethodModule, FranchiseModule, DbModule],
  controllers: [AcquiringController],
  providers: [
    AcquiringService,
    AcquiringSaveMethodFabric,
    AcquiringProcessPayment,
  ],
  exports: [AcquiringService],
})
export class AcquiringModule {}
