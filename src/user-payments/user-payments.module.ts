import { Module } from '@nestjs/common';
import { UserPaymentsService } from './user-payments.service';
import { UserPaymentsController } from './user-payments.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [UserPaymentsController],
  providers: [UserPaymentsService],
})
export class UserPaymentsModule {}
