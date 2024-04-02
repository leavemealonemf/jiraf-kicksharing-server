import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { ScooterService } from 'src/scooter/scooter.service';
import { generateUUID } from '@common/utils';
import { StartTripProcessDto } from './dto/start-trip-process.dto';
import { EndTripProcessDto } from './dto/end-trip-process.dto';
import { v4 as uuid } from 'uuid';
import { TariffService } from 'src/tariff/tariff.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IActiveTripRoot } from './interfaces';

const CACHE_TTL = 1 * 3600000;

@Injectable()
export class TripProcessService {
  private readonly logger = new Logger(TripProcessService.name);

  constructor(
    private readonly scooterService: ScooterService,
    private readonly tariffService: TariffService,
    private readonly dbService: DbService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async start(dto: StartTripProcessDto, userId: number) {
    const scooterRes = await this.scooterService.findOneMobile(dto.scooterId);

    const tariff = await this.tariffService.findOne(dto.tariffId);

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

    const trip = {
      uuid: uuid(),
      tripInfo: {
        id: isTripCreated.id,
        startTime: isTripCreated.startTime,
        uuid: isTripCreated.tripId,
        tariffId: isTripCreated.tariffId,
        paused: false,
        pricing: {
          minute: tariff.minuteCost,
          pause: tariff.pauseCost,
        },
        pauseIntervals: [],
        scooter: {
          scooter: updateScooterStatus,
          rightechScooter: scooterRes.rightechScooter,
        },
      },
    };

    await this.cacheManager.set(trip.uuid, trip, CACHE_TTL);

    return trip;
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

    const cachedTrip = await this.cacheManager.get(dto.tripUUID);

    const copy = Object.assign({}, cachedTrip);

    await this.cacheManager.del(dto.tripUUID);

    return copy;
  }

  async pauseOn(activeTripUUID: string) {
    const trip = await this.cacheManager.get<IActiveTripRoot>(activeTripUUID);
    const tripWithPauseIntervals = Object.assign({}, trip);
    tripWithPauseIntervals.tripInfo.pauseIntervals.push({
      start: new Date().toISOString(),
      end: null,
    });

    await this.cacheManager.set(
      activeTripUUID,
      tripWithPauseIntervals,
      CACHE_TTL,
    );

    return tripWithPauseIntervals;
  }

  async pauseOff(activeTripUUID: string) {
    const trip = await this.cacheManager.get<IActiveTripRoot>(activeTripUUID);
    const tripWithPauseIntervals = Object.assign({}, trip);

    if (tripWithPauseIntervals.tripInfo.pauseIntervals.length === 1) {
      tripWithPauseIntervals.tripInfo.pauseIntervals[0].end =
        new Date().toISOString();
    } else {
      tripWithPauseIntervals.tripInfo.pauseIntervals[
        tripWithPauseIntervals.tripInfo.pauseIntervals.length - 1
      ].end = new Date().toISOString();
    }

    await this.cacheManager.set(
      activeTripUUID,
      tripWithPauseIntervals,
      CACHE_TTL,
    );

    return tripWithPauseIntervals;
  }

  async savePhoto() {
    return null;
  }
}
