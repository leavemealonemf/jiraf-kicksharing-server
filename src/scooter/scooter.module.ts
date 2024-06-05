import { Module } from '@nestjs/common';
import { ScooterService } from './scooter.service';
import { ScooterController } from './scooter.controller';
import { DbModule } from 'src/db/db.module';
import { RightechScooterService } from 'src/rightech-scooter/rightech-scooter.service';
import { SettingsModule } from 'src/settings/settings.module';
import { FranchiseModule } from 'src/franchise/franchise.module';

@Module({
  imports: [DbModule, SettingsModule, FranchiseModule],
  controllers: [ScooterController],
  providers: [ScooterService, RightechScooterService],
  exports: [ScooterService],
})
export class ScooterModule {}
