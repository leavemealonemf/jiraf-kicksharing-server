import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ScooterModelService } from './scooter-model.service';
import { CreateScooterModelDto } from './dto/create-scooter-model.dto';
import { UpdateScooterModelDto } from './dto/update-scooter-model.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('scooter-model')
@ApiTags('ScooterModel (Модель скутера)')
@ApiBearerAuth()
export class ScooterModelController {
  constructor(private readonly scooterModelService: ScooterModelService) {}

  @Post()
  create(@Body() createScooterModelDto: CreateScooterModelDto) {
    return this.scooterModelService.create(createScooterModelDto);
  }

  @Get()
  findAll() {
    return this.scooterModelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scooterModelService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScooterModelDto: UpdateScooterModelDto,
  ) {
    return this.scooterModelService.update(+id, updateScooterModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scooterModelService.remove(+id);
  }
}
