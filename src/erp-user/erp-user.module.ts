import { Module } from '@nestjs/common';
import { ErpUserService } from './erp-user.service';
import { ErpUserController } from './erp-user.controller';
import { DbModule } from 'src/db/db.module';
import { MailModule } from 'src/mail/mail.module';
import { ERP_USER_FABRICS } from './fabrics';

@Module({
  imports: [DbModule, MailModule],
  controllers: [ErpUserController],
  providers: [ErpUserService, ...ERP_USER_FABRICS],
  exports: [ErpUserService],
})
export class ErpUserModule {}
