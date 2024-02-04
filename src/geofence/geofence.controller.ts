import { Controller, Get, Post } from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Геозоны и типы')
@ApiBearerAuth()
@Controller('geofence')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) {}

  @Get('types')
  async getGeofenceTypes() {
    return this.geofenceService.getGeofenceTypes();
  }

  @Post('types')
  async createGeofenceType() {
    this.geofenceService.createGeofenceType();
  }
}
