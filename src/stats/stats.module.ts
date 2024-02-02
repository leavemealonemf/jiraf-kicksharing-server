import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { DbModule } from 'src/db/db.module';
import { TripModule } from 'src/trip/trip.module';

@Module({
  imports: [DbModule, TripModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
