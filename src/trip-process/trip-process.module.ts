import { Module } from '@nestjs/common';
import { TripProcessService } from './trip-process.service';
import { TripProcessController } from './trip-process.controller';
import { DbModule } from 'src/db/db.module';
import { ScooterModule } from 'src/scooter/scooter.module';
import { TariffModule } from 'src/tariff/tariff.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    DbModule,
    ScooterModule,
    TariffModule,
    UserModule,
    CacheModule.register(),
  ],
  controllers: [TripProcessController],
  providers: [TripProcessService],
})
export class TripProcessModule {}
