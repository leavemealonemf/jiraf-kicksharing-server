import { Module } from '@nestjs/common';
import { ErpUserService } from './erp-user.service';
import { ErpUserController } from './erp-user.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [ErpUserController],
  providers: [ErpUserService],
  exports: [ErpUserService],
})
export class ErpUserModule {}
