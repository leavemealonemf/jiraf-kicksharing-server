import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@common/decorators';
import { UpdateSettingDto } from './dto/update-setting.dto';

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

  @Public()
  @Patch(':id')
  async updateSettings(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.updateSettings(+id, dto);
  }
}
