import { Module } from '@nestjs/common';
import { FranchiseService } from './franchise.service';
import { FranchiseController } from './franchise.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [FranchiseController],
  providers: [FranchiseService],
  exports: [FranchiseService],
})
export class FranchiseModule {}
