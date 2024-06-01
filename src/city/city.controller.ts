import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { Platforms } from '@common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(PlatformsGuard)
@Platforms('WEB')
@ApiTags('Города')
@ApiBearerAuth()
@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    return await this.cityService.create(createCityDto);
  }

  @Get()
  async findAll() {
    return await this.cityService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.cityService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return await this.cityService.update(+id, updateCityDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.cityService.remove(+id);
  }
}
