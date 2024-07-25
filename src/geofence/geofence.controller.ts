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
import { CurrentUser } from '@common/decorators';
import { ErpUser } from '@prisma/client';

@ApiTags('Геозоны и типы')
@ApiBearerAuth()
@Controller('geofence')
export class GeofenceController {
  constructor(private readonly geofenceService: GeofenceService) {}

  @Get()
  async getGeofences(@CurrentUser() erpUser: ErpUser) {
    return await this.geofenceService.getGeofences(erpUser);
  }

  @Post()
  async createGeofence(
    @Body() dto: CreateGeofenceDto,
    @CurrentUser() erpUser: ErpUser,
  ) {
    return this.geofenceService.createGeofence(dto, erpUser);
  }

  @Get('mobile')
  async getMobileGeofences() {
    return await this.geofenceService.getGeofencesInMobile();
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
  async getGeofenceTypes(@CurrentUser() erpUser: ErpUser) {
    return this.geofenceService.getGeofenceTypes(erpUser);
  }

  @Post('types')
  async createGeofenceType(@Body() franchiseId: number) {
    this.geofenceService.createGeofenceType(franchiseId);
  }

  @Patch('types/:id')
  async updateGeofenceType(
    @Param('id') id: string,
    @Body() dto: UpdateGeofenceTypeDto,
  ) {
    return this.geofenceService.updateGeofenceType(+id, dto);
  }
}
