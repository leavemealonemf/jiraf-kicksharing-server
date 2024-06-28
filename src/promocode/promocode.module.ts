import { Module } from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { PromocodeController } from './promocode.controller';
import { DbModule } from 'src/db/db.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [DbModule, PaymentsModule],
  controllers: [PromocodeController],
  providers: [PromocodeService],
})
export class PromocodeModule {}
