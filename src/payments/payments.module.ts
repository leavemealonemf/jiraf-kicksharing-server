import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DbModule } from 'src/db/db.module';
import { UserModule } from 'src/user/user.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { SavePaymentFabric } from './gateways/payments.save-paymnet.fabric';

@Module({
  imports: [DbModule, UserModule, SubscriptionModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, SavePaymentFabric],
  exports: [PaymentsService],
})
export class PaymentsModule {}
