import { Module } from '@nestjs/common';
import { FineService } from './fine.service';
import { FineController } from './fine.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [FineController],
  providers: [FineService],
})
export class FineModule {}
