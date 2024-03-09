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
import { ScooterModelModule } from './scooter-model/scooter-model.module';
import { WsGateway } from './socket/socket.service';
import { RightechScooterService } from './rightech-scooter/rightech-scooter.service';
import { TariffModule } from './tariff/tariff.module';
import { PromocodeModule } from './promocode/promocode.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from './user/user.module';
import { TripModule } from './trip/trip.module';
import { StatsService } from './stats/stats.service';
import { StatsModule } from './stats/stats.module';
import { GeofenceService } from './geofence/geofence.service';
import { GeofenceModule } from './geofence/geofence.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ErpUserModule,
    DbModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development',
    }),
    MailModule,
    FranchiseModule,
    ParkingModule,
    ScooterModule,
    ScooterModelModule,
    TariffModule,
    PromocodeModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    UserModule,
    TripModule,
    StatsModule,
    GeofenceModule,
    SubscriptionModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    WsGateway,
    RightechScooterService,
    StatsService,
    GeofenceService,
  ],
})
export class AppModule {}
