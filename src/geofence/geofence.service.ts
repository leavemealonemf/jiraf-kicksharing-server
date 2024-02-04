import { Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class GeofenceService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async getGeofenceTypes() {
    return this.dbService.geofenceType.findMany({ include: { params: true } });
  }

  async createGeofenceType() {
    const data = [
      {
        colorHex: '#000',
        name: 'Зона парковки',
      },
      {
        colorHex: '#000',
        name: 'Зона запрета парковки',
      },
      {
        colorHex: '#000',
        name: 'Зона платной парковки',
      },
      {
        colorHex: '#000',
        name: 'Зона запрета самокатов',
      },
      {
        colorHex: '#000',
        name: 'Зона контроля скорости: круглосуточно',
      },
      {
        colorHex: '#000',
        name: 'Зона контроля скорости: по расписанию',
      },
    ];

    data.forEach((obj) => {
      this.dbService.geofenceType
        .create({
          data: {
            colorHex: obj.colorHex,
            name: obj.name,
          },
        })
        .then((res) => {
          this.dbService.geofenceTypeParams
            .create({
              data: {
                geofenceTypeId: res.id,
              },
            })
            .catch((err) => {
              this.logger.error(err);
            });
        });
    });
  }
}
