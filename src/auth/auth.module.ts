import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ErpUserModule } from 'src/erp-user/erp-user.module';
import { options } from './config';
import { DbModule } from 'src/db/db.module';
import { STRATEGIES } from './strategies';
import { GUARDS } from './guards';
import { FranchiseModule } from 'src/franchise/franchise.module';
import { MailModule } from 'src/mail/mail.module';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        accountSid: config.get('SMS_SID'),
        authToken: config.get('SMS_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    JwtModule.registerAsync(options()),
    ErpUserModule,
    UserModule,
    DbModule,
    FranchiseModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
})
export class AuthModule {}
