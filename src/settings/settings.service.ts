import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async findAll() {
    return this.dbService.settings.findFirst();
  }

  async updateSettings(id: number, dto: UpdateSettingDto) {
    const isExist = await this.dbService.settings.findFirst({
      where: { id: id },
    });

    if (!isExist) {
      throw new NotFoundException(`Настройки с id ${id} не найдены`);
    }

    return this.dbService.settings.update({
      where: { id: id },
      data: {
        scooterSettings: {
          metersToBooking: dto.metersToBooking,
          metersToRent: dto.metersToRent,
        },
      },
    });
  }

  async createScooterSettings() {
    return this.dbService.settings
      .create({
        data: {
          scooterSettings: {
            metersToBooking: 1500,
            metersToRent: 1000,
          },
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }
}
