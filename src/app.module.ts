import { Module } from '@nestjs/common';
import { ErpUserModule } from './erp-user/erp-user.module';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ErpUserModule,
    DbModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
