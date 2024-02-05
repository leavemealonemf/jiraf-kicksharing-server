import { Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { UpdateGeofenceTypeDto } from './dto/update-geofencetype.dto';

@Injectable()
export class GeofenceService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async getGeofenceTypes() {
    return this.dbService.geofenceType.findMany({
      include: { params: true },
      orderBy: { id: 'asc' },
    });
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

  async updateGeofenceType(id: number, dto: UpdateGeofenceTypeDto) {
    try {
      const updatedType = await this.dbService.geofenceType.update({
        where: { id: id },
        // include: { params: true },
        data: {
          canParking: dto.type.canParking,
          canRiding: dto.type.canRiding,
          colorHex: dto.type.colorHex,
          description: dto.type.description,
          isParkingFine: dto.type.isParkingFine,
          isScooterBehavior: dto.type.isScooterBehavior,
          noiceToTheClient: dto.type.noiceToTheClient,
        },
      });

      if (updatedType.id) {
        const params = await this.dbService.geofenceTypeParams.update({
          where: { geofenceTypeId: updatedType.id },
          data: {
            notificationMessage: dto.params.notificationMessage,
            parkingFinePrice: dto.params.parkingFinePrice,
            speedReduction: dto.params.speedReduction,
            zoneTimeCondition: dto.params.zoneTimeCondition,
          },
        });
        // console.log(params);
        return {
          ...updatedType,
          params: params,
        };
      }

      // return updatedType;
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }
}
