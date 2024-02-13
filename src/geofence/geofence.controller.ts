import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateGeofenceTypeDto } from './dto/update-geofencetype.dto';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';

@ApiTags('Геозоны и типы')
@ApiBearerAuth()
@Controller('geofence')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) {}

  @Get()
  async getGeofences() {
    return this.geofenceService.getGeofences();
  }

  @Post()
  async createGeofence(@Body() dto: CreateGeofenceDto) {
    return this.geofenceService.createGeofence(dto);
  }

  @Patch(':id')
  async updateGeofence(
    @Param('id') id: string,
    @Body() dto: UpdateGeofenceDto,
  ) {
    return this.geofenceService.updateGeofence(+id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.geofenceService.deleteGeofence(+id);
  }

  @Get('types')
  async getGeofenceTypes() {
    return this.geofenceService.getGeofenceTypes();
  }

  @Post('types')
  async createGeofenceType() {
    this.geofenceService.createGeofenceType();
  }

  @Patch('types/:id')
  async updateGeofenceType(
    @Param('id') id: string,
    @Body() dto: UpdateGeofenceTypeDto,
  ) {
    return this.geofenceService.updateGeofenceType(+id, dto);
  }
}
