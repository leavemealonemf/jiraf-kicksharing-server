import { Module } from '@nestjs/common';
import { DebtService } from './debt.service';
import { DebtController } from './debt.controller';
import { DbModule } from 'src/db/db.module';
import { AcquiringModule } from 'src/acquiring/acquiring.module';
import { PaymentMethodModule } from 'src/payment-method/payment-method.module';

@Module({
  imports: [DbModule, AcquiringModule, PaymentMethodModule],
  controllers: [DebtController],
  providers: [DebtService],
})
export class DebtModule {}
