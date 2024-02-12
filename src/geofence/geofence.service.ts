import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { UpdateGeofenceTypeDto } from './dto/update-geofencetype.dto';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { GeofenceDrawType } from '@prisma/client';
import { generateUUID } from '@common/utils';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GeofenceService {
  private readonly logger = new Logger();

  constructor(private readonly dbService: DbService) {}

  async getGeofences() {
    return this.dbService.geofence.findMany({
      orderBy: { dateTimeCreated: 'desc' },
      include: { type: true },
    });
  }

  async createGeofence(dto: CreateGeofenceDto) {
    const uuid = generateUUID();
    const path = `uploads/images/geofences/${uuid}/photo/image.png`;

    if (dto.img) {
      this.saveFile(dto.img, path);
    }

    return this.dbService.geofence
      .create({
        data: {
          uuid: uuid,
          address: dto.address,
          allTimeSpeedLimit: dto.allTimeSpeedLimit,
          coordinates: dto.coordinates,
          firstSpeedLimit: dto.firstSpeedLimit,
          firstTimePeriodEnd: dto.firstTimePeriodEnd,
          firtsTimePeriodStart: dto.firtsTimePeriodStart,
          img: dto.img ? path : null,
          name: dto.name,
          radius: dto.radius,
          secondSpeedLimit: dto.secondSpeedLimit,
          secondTimePeriodEnd: dto.secondTimePeriodEnd,
          secondTimePeriodStart: dto.secondTimePeriodStart,
          typeId: dto.typeId,
        },
        include: { type: true },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async getGeofenceTypes() {
    return this.dbService.geofenceType.findMany({
      include: { params: true },
      orderBy: { id: 'asc' },
    });
  }

  async createGeofenceType() {
    const data = [
      {
        colorHex: '#F32C2C',
        uuid: generateUUID(),
        name: 'Зона аренды',
        drawType: GeofenceDrawType.POLYGON,
        slug: 'mainZone',
        canParking: true,
        canRiding: true,
        isScooterBehavior: true,
        noiceToTheClient: true,

        speedReduction: 5,
        notificationMessage:
          'Внимание! Вы заехали в зону, где кататься запрещено. Вернитесь обратно.',
      },
      {
        colorHex: '#52F66C',
        uuid: generateUUID(),
        name: 'Парковка платная (круговая)',
        subTitle: 'Здесь начинают и завершают аренду',
        drawType: GeofenceDrawType.CIRCLE,
        slug: 'paidParkingCircle',
        canParking: true,
        canRiding: true,
        description: 'Здесь вы можете завершить аренду за деньги',
        parkingPrice: 50,
      },
      {
        colorHex: '#2CABF3',
        uuid: generateUUID(),
        subTitle: 'Здесь начинают и завершают аренду',
        name: 'Зона парковки (полигон)',
        drawType: GeofenceDrawType.POLYGON,
        slug: 'parkingPolygon',
        canParking: true,
        canRiding: true,
      },
      {
        colorHex: '#2CABF3',
        uuid: generateUUID(),
        name: 'Парковка (круговая)',
        subTitle: 'Здесь начинают и завершают аренду',
        drawType: GeofenceDrawType.CIRCLE,
        slug: 'parkingCircle',
        canParking: true,
        canRiding: true,
      },
      {
        colorHex: '#414044',
        uuid: generateUUID(),
        name: 'Зона запрета парковки',
        subTitle: 'Круглосуточно',
        drawType: GeofenceDrawType.POLYGON,
        slug: 'notParking',
        canParking: false,
        canRiding: true,
        description:
          'Здесь нельзя парковаться и оставлять самокаты, даже ненадолго',
        parkingFinePrice: 100,
      },
      {
        colorHex: '#F32C2C',
        uuid: generateUUID(),
        name: 'Зона запрета поездок',
        subTitle: 'Круглосуточно',
        drawType: GeofenceDrawType.POLYGON,
        slug: 'notScooters',
        canParking: false,
        canRiding: false,
        description:
          'Здесь запрещено кататься. Наслаждайтесь остальной частью города',
        isScooterBehavior: true,
        noiceToTheClient: true,

        parkingFinePrice: 100,
        speedReduction: 5,
        notificationMessage:
          'Внимание! Вы заехали в зону, где кататься запрещено. Вернитесь обратно.',
      },
      {
        colorHex: '#414044',
        uuid: generateUUID(),
        name: 'Зона контроля скорости: круглосуточно',
        subTitle: 'Круглосуточно',
        drawType: GeofenceDrawType.POLYGON,
        slug: 'speedLimitAllDay',
        canParking: false,
        canRiding: true,
        description:
          'Скорость самоката автоматически снизится, так безопаснее для всех',
      },
      {
        colorHex: '#414044',
        uuid: generateUUID(),
        name: 'Зона контроля скорости: по расписанию',
        subTitle: 'По расписанию',
        drawType: GeofenceDrawType.POLYGON,
        slug: 'speedLimitSchedule',
        canParking: false,
        canRiding: true,
        description:
          'Скорость самоката автоматически снизится, так безопаснее для всех',
        secondDescription:
          'Сейчас нет никаких ограничений, скорость самоката не измениться',
      },
    ];

    data.forEach(async (obj) => {
      const res = await this.dbService.geofenceType.create({
        data: {
          colorHex: obj.colorHex,
          uuid: obj.uuid,
          slug: obj.slug,
          name: obj.name,
          drawType: obj.drawType,
          subTitle: obj.subTitle,
          canParking: obj.canParking,
          canRiding: obj.canRiding,
          description: obj.description,
          parkingPrice: obj.parkingPrice,
          isScooterBehavior: obj.isScooterBehavior,
          noiceToTheClient: obj.noiceToTheClient,
          secondDescription: obj.secondDescription,
        },
      });

      if (!res) {
        throw new ForbiddenException('Ошибка при создании типов зон');
      }

      const elementIndex = data.findIndex((element) => {
        return element.uuid === res.uuid;
      });

      await this.dbService.geofenceTypeParams.create({
        data: {
          geofenceTypeId: res.id,
          parkingFinePrice: data[elementIndex]?.parkingFinePrice,
          speedReduction: data[elementIndex]?.speedReduction,
          notificationMessage: data[elementIndex]?.notificationMessage,
        },
      });
    });
  }

  async updateGeofenceType(id: number, dto: UpdateGeofenceTypeDto) {
    try {
      const updatedType = await this.dbService.geofenceType.update({
        where: { id: id },
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
        return {
          ...updatedType,
          params: params,
        };
      }
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  async deleteGeofence(id: number) {
    const geofence = await this.dbService.geofence.findFirst({
      where: { id: id },
    });

    if (!geofence) {
      throw new NotFoundException(
        `Невозможно удалить. Записи с id ${id} не существует`,
      );
    }

    return this.dbService.geofence
      .delete({ where: { id: id } })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  private saveFile(photo: string, entityPath: string) {
    const base64String = photo;
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = entityPath;

    const directoryPath = path.dirname(filePath);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
  }
}
