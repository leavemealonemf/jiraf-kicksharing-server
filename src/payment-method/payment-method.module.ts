import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodController } from './payment-method.controller';
import { DbModule } from 'src/db/db.module';
import { UserModule } from 'src/user/user.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [DbModule, UserModule, SubscriptionModule],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}
