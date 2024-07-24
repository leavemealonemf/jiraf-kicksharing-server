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
import { UpdateGeofenceDto } from './dto/update-geofence.dto';
import { ScooterService } from 'src/scooter/scooter.service';

@Injectable()
export class GeofenceService {
  private readonly logger = new Logger();

  constructor(
    private readonly dbService: DbService,
    private readonly scooterService: ScooterService,
  ) {}

  async getGeofences() {
    return this.dbService.geofence.findMany({
      orderBy: { dateTimeCreated: 'desc' },
      include: { type: true },
    });
  }

  async getGeofencesInMobile() {
    const geofences = await this.dbService.geofence.findMany({
      orderBy: { dateTimeCreated: 'desc' },
      include: { type: true },
    });

    if (geofences.length === 0) {
      return [];
    }

    // const scooters = await this.sortScootersInArray();
    const scooters = await this.scooterService.findAllMobile();

    console.log('GET SCOOTERS', scooters);

    const geofencesWithOrWithoutScooters = this.sortScootersInParkingZone(
      geofences,
      scooters,
    );

    console.log(
      'geofencesWithOrWithoutScooters',
      geofencesWithOrWithoutScooters,
    );

    // comma

    const geofencesWithLimit = this.getCurrentSpeedLimit(
      geofencesWithOrWithoutScooters,
    );

    return geofencesWithLimit;
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
          cityId: dto.cityId,
          franchiseId: dto.franchiseId,
        },
        include: { type: true },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async updateGeofence(id: number, dto: UpdateGeofenceDto) {
    const path = `uploads/images/geofences/${dto.uuid}/photo/image.png`;

    if (dto.img === path) {
      return this.dbService.geofence
        .update({ where: { id: id }, data: dto, include: { type: true } })
        .catch((err) => {
          this.logger.error(err);
          return null;
        });
    }

    if (dto.img) {
      this.saveFile(dto.img, path);
    }

    return this.dbService.geofence
      .update({ where: { id: id }, data: dto, include: { type: true } })
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

  private async sortScootersInArray() {
    const scooters = await this.scooterService.findAll();

    const scootersWithCoords = [];

    if (scooters.scooters.length === 0) {
      return scootersWithCoords;
    }

    for (let i = 0; i < scooters.scooters.length; i++) {
      const rightechScooters = scooters.rightechScooters.filter(
        (x) => x.id === scooters.scooters[i].deviceId,
      );

      if (rightechScooters.length === 0) return;

      for (let j = 0; j < rightechScooters.length; j++) {
        if (
          rightechScooters[j].state &&
          rightechScooters[j].state.lat &&
          rightechScooters[j].state.lon &&
          rightechScooters[j].id === scooters.scooters[i].deviceId
        ) {
          scootersWithCoords.push({
            scooterId: scooters.scooters[i].id,
            lat: rightechScooters[j].state.lat,
            lng: rightechScooters[j].state.lon,
          });
        }
      }
    }
    return scootersWithCoords;
  }

  private sortScootersInParkingZone(geofences: any[], scooters: any[]) {
    const geofencesWithScooters = [];

    // if (scooters.length === 0) {
    //   return geofencesWithScooters;
    // }

    for (let i = 0; i < geofences.length; i++) {
      if (geofences.length === 0) {
        geofencesWithScooters.push({
          ...geofences[i],
          scooters: [],
          noScooters: true,
        });
      }

      // INCLUDE SCOOTERS ONLY IN PARKING GEOFENCE

      const zoneScooters = [];

      for (let j = 0; j < scooters.length; j++) {
        const scooterCoordinates = {
          lat: scooters[j].rightechScooter.state.lat,
          lng: scooters[j].rightechScooter.state.lon,
        };

        const coordinates = JSON.parse(geofences[i].coordinates);

        const radius = geofences[i].radius;

        const scooterInZone = this.isScooterInZone(
          scooterCoordinates,
          coordinates,
          radius,
        );

        if (scooterInZone && scooters[i].controlledStatuses === 'ONLINE') {
          zoneScooters.push(scooters[j]);
        }
      }

      geofencesWithScooters.push({
        ...geofences[i],
        scooters: geofences[i].type.drawType === 'CIRCLE' ? zoneScooters : [],
        noScooters:
          geofences[i].type.drawType === 'CIRCLE'
            ? zoneScooters.length === 0
            : true,
      });
    }
    return geofencesWithScooters;
  }

  private isScooterInZone(scooterCoordinates, coordinates, zoneRadius) {
    const earthRadius = 6371000;

    const zoneCenter = this.getZoneCenter(coordinates);

    const scooterLatRad = this.toRadians(scooterCoordinates.lat);
    const scooterLngRad = this.toRadians(scooterCoordinates.lng);
    const zoneCenterLatRad = this.toRadians(zoneCenter.lat);
    const zoneCenterLngRad = this.toRadians(zoneCenter.lng);

    const distance =
      Math.acos(
        Math.sin(scooterLatRad) * Math.sin(zoneCenterLatRad) +
          Math.cos(scooterLatRad) *
            Math.cos(zoneCenterLatRad) *
            Math.cos(scooterLngRad - zoneCenterLngRad),
      ) * earthRadius;

    return distance <= zoneRadius;
  }

  private getZoneCenter(coordinates: any) {
    if (Array.isArray(coordinates)) {
      const lat =
        coordinates.reduce((sum, point) => sum + point.lat, 0) /
        coordinates.length;

      const lng =
        coordinates.reduce((sum, point) => sum + point.lng, 0) /
        coordinates.length;

      return {
        lat,
        lng,
      };
    } else {
      return {
        lat: coordinates.lat,
        lng: coordinates.lng,
      };
    }
  }

  private toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  private getCurrentSpeedLimit(geofences: any[]) {
    if (geofences.length === 0) return;

    const result = [];

    for (const geofence of geofences) {
      if (geofence.type.slug === 'speedLimitSchedule') {
        const currentDate = new Date();
        const currentTime =
          currentDate.getHours() * 60 + currentDate.getMinutes();

        const parseInterval = (start: any, end: any) => {
          const startTime =
            Number(start.split(':')[0]) * 60 + Number(start.split(':')[1]);
          const endTime =
            Number(end.split(':')[0]) * 60 + Number(end.split(':')[1]);
          return { startTime, endTime };
        };

        const firstInterval = parseInterval(
          geofence.firtsTimePeriodStart,
          geofence.firstTimePeriodEnd,
        );

        const secondInterval = parseInterval(
          geofence.secondTimePeriodStart,
          geofence.secondTimePeriodEnd,
        );

        if (secondInterval.endTime < secondInterval.startTime) {
          secondInterval.endTime += 24 * 60;
        }

        let intervalType = 'noInterval';

        if (
          currentTime >= firstInterval.startTime &&
          currentTime <= firstInterval.endTime
        ) {
          intervalType = 'firstInterval';
        } else if (
          currentTime >= secondInterval.startTime &&
          currentTime <= secondInterval.endTime
        ) {
          intervalType = 'secondInterval';
        }

        const updatedGeofence = {
          ...geofence,
          currentSpeedLimit: intervalType,
        };
        result.push(updatedGeofence);
      } else {
        result.push(geofence);
      }
    }

    return result;
  }
}
