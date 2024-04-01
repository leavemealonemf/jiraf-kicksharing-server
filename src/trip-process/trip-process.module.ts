import { Module } from '@nestjs/common';
import { TripProcessService } from './trip-process.service';
import { TripProcessController } from './trip-process.controller';
import { DbModule } from 'src/db/db.module';
import { ScooterModule } from 'src/scooter/scooter.module';

@Module({
  imports: [DbModule, ScooterModule],
  controllers: [TripProcessController],
  providers: [TripProcessService],
})
export class TripProcessModule {}
