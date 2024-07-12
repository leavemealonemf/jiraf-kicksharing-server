import { Module } from '@nestjs/common';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { DbModule } from 'src/db/db.module';
import { AcquiringModule } from 'src/acquiring/acquiring.module';
import { PaymentMethodModule } from 'src/payment-method/payment-method.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [DbModule, AcquiringModule, PaymentMethodModule, PaymentsModule],
  controllers: [DebtController],
  providers: [DebtService],
})
export class DebtModule {}
