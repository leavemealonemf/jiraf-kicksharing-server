import { Controller, Get, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators';

@ApiTags('Настройки')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get()
  async findAll() {
    return this.settingsService.findAll();
  }

  @Public()
  @Post()
  async createScooterSettings() {
    return this.settingsService.createScooterSettings();
  }
}
