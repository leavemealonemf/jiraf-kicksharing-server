import { Module } from '@nestjs/common';
import { FranchiseService } from './franchise.service';
import { FranchiseController } from './franchise.controller';
import { DbModule } from 'src/db/db.module';
import { AuthModule } from 'src/auth/auth.module';
import { CityModule } from 'src/city/city.module';
import { GeofenceModule } from 'src/geofence/geofence.module';

@Module({
  imports: [DbModule, AuthModule, CityModule, GeofenceModule],
  controllers: [FranchiseController],
  providers: [FranchiseService],
  exports: [FranchiseService],
})
export class FranchiseModule {}
