import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ScooterService } from 'src/scooter/scooter.service';
import { generateUUID } from '@common/utils';
import { StartTripProcessDto } from './dto/start-trip-process.dto';
import { EndTripProcessDto } from './dto/end-trip-process.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TripProcessService {
  private readonly logger = new Logger(TripProcessService.name);

  constructor(
    private readonly scooterService: ScooterService,
    private readonly dbService: DbService,
  ) {}

  async start(dto: StartTripProcessDto, userId: number) {
    const scooterRes = await this.scooterService.findOneMobile(dto.scooterId);
    const isTripCreated = await this.dbService.trip.create({
      data: {
        tripId: generateUUID(),
        userId: userId,
        scooterId: scooterRes.scooter.id,
        tariffId: dto.tariffId,
      },
    });

    if (!isTripCreated) {
      throw new ForbiddenException(
        'Не удалось начать поездку. Ошибка при создании поездки',
      );
    }

    const updateScooterStatus = await this.dbService.scooter.update({
      where: { deviceId: dto.scooterId },
      data: {
        rented: true,
      },
    });

    if (!updateScooterStatus) {
      throw new ForbiddenException(
        `Не удалось поменять статус скутера с id: ${dto.scooterId}`,
      );
    }

    return {
      uuid: uuid(),
      tripInfo: {
        id: isTripCreated.id,
        startTime: isTripCreated.startTime,
        uuid: isTripCreated.tripId,
        tariffId: isTripCreated.tariffId,
        scooter: {
          scooter: updateScooterStatus,
          rightechScooter: scooterRes.rightechScooter,
        },
      },
    };
  }

  async end(dto: EndTripProcessDto) {
    const trip = await this.dbService.trip.update({
      where: { id: dto.tripId },
      data: {
        endTime: new Date().toISOString(),
        coordinates: dto.coordinates ? dto.coordinates : null,
        scooter: {
          update: {
            rented: false,
          },
        },
        rating: 5,
        bonusesUsed: 50,
        price: 500,
        distance: 1000,
      },
    });

    if (!trip) {
      throw new BadRequestException(
        `Не удалось завершить поездку с id: ${dto.tripId}`,
      );
    }

    return trip;
  }

  async savePhoto() {
    return null;
  }
}
