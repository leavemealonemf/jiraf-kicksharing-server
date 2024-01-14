import { Module } from '@nestjs/common';
import { ErpUserModule } from './erp-user/erp-user.module';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { FranchiseModule } from './franchise/franchise.module';
import { ParkingModule } from './parking/parking.module';
import { ScooterModule } from './scooter/scooter.module';

@Module({
  imports: [
    ErpUserModule,
    DbModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    FranchiseModule,
    ParkingModule,
    ScooterModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
