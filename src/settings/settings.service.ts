import { Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async findAll() {
    return this.dbService.settings.findFirst();
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
