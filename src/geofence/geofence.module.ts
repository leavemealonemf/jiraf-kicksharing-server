import { Module } from '@nestjs/common';
import { GeofenceController } from './geofence.controller';
import { GeofenceService } from './geofence.service';
import { DbModule } from 'src/db/db.module';
import { ScooterModule } from 'src/scooter/scooter.module';

@Module({
  imports: [DbModule, ScooterModule],
  controllers: [GeofenceController],
  providers: [GeofenceService],
  exports: [GeofenceService],
})
export class GeofenceModule {}
