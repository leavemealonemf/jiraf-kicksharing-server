import { PartialType } from '@nestjs/swagger';
import { CreateScooterModelDto } from './create-scooter-model.dto';

export class UpdateScooterModelDto extends PartialType(CreateScooterModelDto) {}
