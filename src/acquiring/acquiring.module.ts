import { Module } from '@nestjs/common';
import { AcquiringService } from './acquiring.service';
import { AcquiringController } from './acquiring.controller';
import { AcquiringSaveMethodFabric } from './gateways';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [AcquiringController],
  providers: [AcquiringService, AcquiringSaveMethodFabric],
})
export class AcquiringModule {}
