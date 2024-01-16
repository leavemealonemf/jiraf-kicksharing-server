import { Module } from '@nestjs/common';
import { ScooterModelService } from './scooter-model.service';
import { ScooterModelController } from './scooter-model.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [ScooterModelController],
  providers: [ScooterModelService],
})
export class ScooterModelModule {}
