import { Module } from '@nestjs/common';
import { ErpUserService } from './erp-user.service';
import { ErpUserController } from './erp-user.controller';
import { DbModule } from 'src/db/db.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [DbModule, MailModule],
  controllers: [ErpUserController],
  providers: [ErpUserService],
  exports: [ErpUserService],
})
export class ErpUserModule {}
