import { Module } from '@nestjs/common';
import { ScooterService } from './scooter.service';
import { ScooterController } from './scooter.controller';

@Module({
  controllers: [ScooterController],
  providers: [ScooterService],
})
export class ScooterModule {}
