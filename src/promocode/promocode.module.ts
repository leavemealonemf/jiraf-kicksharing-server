import { Module } from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { PromocodeController } from './promocode.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [PromocodeController],
  providers: [PromocodeService],
})
export class PromocodeModule {}
