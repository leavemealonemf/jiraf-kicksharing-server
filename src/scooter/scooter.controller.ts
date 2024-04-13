import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ScooterService } from './scooter.service';
import { CreateScooterDto } from './dto/create-scooter.dto';
import { UpdateScooterDto } from './dto/update-scooter.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Scooter (Самокат)')
@ApiBearerAuth()
@Controller('scooter')
export class ScooterController {
  constructor(private readonly scooterService: ScooterService) {}

  @Post()
  create(@Body() createScooterDto: CreateScooterDto) {
    return this.scooterService.create(createScooterDto);
  }

  @Get()
  findAll() {
    return this.scooterService.findAll();
  }

  @Get('/erp')
  findAllErp() {
    return this.scooterService.findAllErp();
  }

  @Get('/mobile')
  findAllMobile() {
    return this.scooterService.findAllMobile();
  }

  @Get('/mobile/test')
  findAllMobileTest() {
    return this.scooterService.findAllMobileTest();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scooterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScooterDto: UpdateScooterDto) {
    return this.scooterService.update(+id, updateScooterDto);
  }

  @Delete(':scooterId/:rightechScooterId')
  remove(
    @Param('scooterId') id: string,
    @Param('rightechScooterId') rightechScooterId: string,
  ) {
    return this.scooterService.remove(+id, rightechScooterId);
  }
}
