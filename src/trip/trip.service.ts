import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { DbService } from 'src/db/db.service';
import { generateUUID } from '@common/utils';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_PAGE_SIZE = 10;

@Injectable()
export class TripService {
  private readonly logger = new Logger(TripService.name);

  constructor(private readonly dbService: DbService) {}

  async create(createTripDto: CreateTripDto) {
    const uuid = generateUUID();

    const path = `uploads/images/trips/${uuid}/photo/image.png`;

    if (createTripDto.photo) {
      this.saveFile(createTripDto.photo, path);
    }

    return await this.dbService.trip
      .create({
        data: {
          endTime: createTripDto.endTime,
          // photo: createTripDto.photo ? path : null,
          price: createTripDto.price,
          startTime: createTripDto.startTime,
          travelTime: createTripDto.travelTime,
          scooterId: createTripDto.scooterId,
          tariffId: createTripDto.tariffId,
          userId: createTripDto.userId,
          rating: createTripDto.rating,
          distance: createTripDto.distance,
          tripId: uuid,
          coordinates: createTripDto.coordinates,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async getUserTrips(userId: number, page: number) {
    const offset = (page - 1) * DEFAULT_PAGE_SIZE;
    const trips = await this.dbService.trip
      .findMany({
        skip: offset,
        take: DEFAULT_PAGE_SIZE,
        orderBy: {
          startTime: 'desc',
        },
        where: { userId: userId },
        include: {
          scooter: {
            select: {
              deviceId: true,
            },
          },
          tariff: {
            select: {
              name: true,
              minuteCost: true,
              boardingCost: true,
              colorHex: true,
            },
          },
          dept: {
            select: {
              id: true,
              price: true,
              paidStatus: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
    return trips;
  }

  async getOneTripMobile(tripId: number, userId: number) {
    const trip = await this.dbService.trip
      .findUnique({
        where: { userId: userId, id: tripId },
        include: {
          scooter: {
            select: {
              deviceId: true,
            },
          },
          tariff: {
            select: {
              name: true,
              minuteCost: true,
              boardingCost: true,
              colorHex: true,
            },
          },
          dept: {
            select: {
              id: true,
              price: true,
              paidStatus: true,
            },
          },
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!trip) {
      throw new NotFoundException(`Поездка с ${tripId} не найдена!`);
    }

    return trip;
  }

  async findAll(interval: string, start: string, end: string) {
    const currentDate = new Date();
    let startDate: Date;

    switch (interval) {
      case 'day':
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(currentDate);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      case 'yesterday':
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(currentDate);
        endDate.setHours(0, 0, 0, 0);
        return this.dbService.trip.findMany({
          where: {
            startTime: {
              gte: startDate.toISOString(),
              lte: endDate.toISOString(),
            },
          },
          orderBy: { startTime: 'desc' },
          include: {
            scooter: true,
            tariff: true,
            user: true,
          },
        });

      case 'custom':
        return this.dbService.trip.findMany({
          where: {
            startTime: {
              gte: start,
              lte: end,
            },
          },
          orderBy: { startTime: 'desc' },
          include: {
            scooter: true,
            tariff: true,
            user: true,
          },
        });
      default:
        startDate = new Date(0);
        break;
    }

    return this.dbService.trip.findMany({
      where: {
        startTime: {
          gte: startDate.toISOString(),
          lte: currentDate.toISOString(),
        },
      },
      orderBy: { startTime: 'desc' },
      include: { scooter: true, tariff: true, user: true },
    });
  }

  async findOne(id: number) {
    const trip = await this.dbService.trip.findFirst({ where: { id: id } });
    if (!trip) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }
    return trip;
  }

  async update(id: number, updateTripDto: UpdateTripDto) {
    const trip = await this.dbService.trip.findFirst({ where: { id: id } });

    if (!trip) {
      throw new NotFoundException(`Запись с id ${id} не найдена`);
    }

    return this.dbService.trip
      .update({ where: { id: id }, data: updateTripDto })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async remove(id: number) {
    const trip = await this.dbService.trip.findFirst({ where: { id: id } });
    if (!trip) {
      throw new NotFoundException(
        `Не получается удалить. Записи с id ${id} не существует!`,
      );
    }
    return this.dbService.trip
      .delete({ where: { id: id } })
      .catch((err) => {
        this.logger.error(err);
        return null;
      })
      .then((res) => {
        fs.rmSync(`uploads/images/trips/${res.tripId}`, {
          recursive: true,
        });
        return res;
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
