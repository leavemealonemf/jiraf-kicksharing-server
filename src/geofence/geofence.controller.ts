import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GeofenceService } from './geofence.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateGeofenceTypeDto } from './dto/update-geofencetype.dto';

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

  @Patch('types/:id')
  async updateGeofenceType(
    @Param('id') id: string,
    @Body() dto: UpdateGeofenceTypeDto,
  ) {
    return this.geofenceService.updateGeofenceType(+id, dto);
  }
}
