import { Module } from '@nestjs/common';
import { FlashCallService } from './flash-call.service';

@Module({
  imports: [],
  controllers: [],
  providers: [FlashCallService],
  exports: [FlashCallService],
})
export class FlashCallModule {}
