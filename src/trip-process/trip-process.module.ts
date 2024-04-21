import { Module } from '@nestjs/common';
import { TripProcessService } from './trip-process.service';
import { TripProcessController } from './trip-process.controller';
import { DbModule } from 'src/db/db.module';
import { ScooterModule } from 'src/scooter/scooter.module';
import { TariffModule } from 'src/tariff/tariff.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from 'src/user/user.module';
import { AcquiringModule } from 'src/acquiring/acquiring.module';
import { PaymentMethodModule } from 'src/payment-method/payment-method.module';
import { RedisOptions } from 'libs/redis';
import { GeofenceModule } from 'src/geofence/geofence.module';

@Module({
  imports: [
    PaymentMethodModule,
    AcquiringModule,
    DbModule,
    ScooterModule,
    TariffModule,
    UserModule,
    GeofenceModule,
    CacheModule.registerAsync(RedisOptions),
  ],
  controllers: [TripProcessController],
  providers: [TripProcessService],
})
export class TripProcessModule {}
