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

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync(options()),
    ErpUserModule,
    DbModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
})
export class AuthModule {}
