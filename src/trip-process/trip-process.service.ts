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
import { GofencingStatus, IActiveTripRoot } from './interfaces';
import { UserService } from 'src/user/user.service';
import * as fs from 'fs';
import * as path from 'path';
import { AcquiringService } from 'src/acquiring/acquiring.service';
import { Scooter, User } from '@prisma/client';
import { PaymentMethodService } from 'src/payment-method/payment-method.service';
import { paymentType } from 'src/acquiring/dtos';
import {
  ScooterCommandHandler,
  getScooterPackets,
} from 'libs/IoT/scooter/handlers';
import { DEVICE_COMMANDS } from 'libs/IoT/scooter/commands';
import { GeofenceService } from 'src/geofence/geofence.service';
import * as turf from '@turf/turf';

const CACHE_TTL = 1 * 3600000;

@Injectable()
export class TripProcessService {
  private readonly logger = new Logger(TripProcessService.name);

  private readonly scooterCommandHandlerIOT = new ScooterCommandHandler();

  constructor(
    private readonly scooterService: ScooterService,
    private readonly tariffService: TariffService,
    private readonly dbService: DbService,
    private readonly userService: UserService,
    private readonly acquiringService: AcquiringService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly geofenceService: GeofenceService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async start(dto: StartTripProcessDto, user: User) {
    const scooterRes = await this.scooterService.findOneMobile(dto.scooterId);

    if (scooterRes.scooter.rented) {
      throw new BadRequestException('Не удалось начать поездку. Самокат занят');
    }

    const userDb = await this.userService.findOneByUUID(user.clientId);

    if (!userDb.activePaymentMethod) {
      throw new BadRequestException('Отсутсвует активный платежный метод');
    }

    const paymentMethod = await this.paymentMethodService.getUserPaymentMethod(
      userDb.id,
      userDb.activePaymentMethod,
    );

    //

    const tariff = await this.tariffService.findOne(dto.tariffId);

    const tripUUID = uuid();

    const scooterUnlockIOT = this.scooterCommandHandlerIOT.sendCommand(
      scooterRes.scooter.deviceIMEI,
      DEVICE_COMMANDS.UNLOCK,
    );

    if (!scooterUnlockIOT) {
      throw new BadRequestException('Не удалось разблокировать устройство');
    }

    const paymentStartDeposit =
      await this.acquiringService.processPaymentTwoSteps({
        description: 'Залог',
        paymentMethodId: paymentMethod.id,
        paymentMethodStringId: paymentMethod.paymentId,
        metadata: {
          type: 'TRIP',
          description: 'Залог за поездку',
        },
        type: paymentType.CARD,
        value: tariff.reservationCost,
      });

    if (!paymentStartDeposit) {
      this.scooterCommandHandlerIOT
        .sendCommand(scooterRes.scooter.deviceIMEI, DEVICE_COMMANDS.LOCK)
        .catch((err) => {
          this.logger.error(err);
          throw new BadRequestException('Не удалось отключить устройство');
        });
      throw new BadRequestException(
        'Не удалось начать поездку. Не удалось списать залог',
      );
    }

    const [isTripCreated, isActiveTripCreated, updateScooterStatus] =
      await this.dbService
        .$transaction([
          this.dbService.trip.create({
            data: {
              tripId: generateUUID(),
              userId: userDb.id,
              scooterId: scooterRes.scooter.id,
              tariffId: dto.tariffId,
            },
          }),
          this.dbService.activeTrip.create({
            data: {
              userId: userDb.id,
              tripUUID: tripUUID,
            },
          }),
          this.dbService.scooter.update({
            where: { deviceId: dto.scooterId },
            data: {
              rented: true,
            },
          }),
        ])
        .catch(async (err) => {
          this.logger.error(err);
          await this.acquiringService.cancelPayment(paymentStartDeposit.id);
          this.scooterCommandHandlerIOT
            .sendCommand(scooterRes.scooter.deviceIMEI, DEVICE_COMMANDS.LOCK)
            .catch((err) => {
              this.logger.error(err);
            });
          throw new ForbiddenException(
            'Не удалось начать поездку. Ошибка при создании поездки',
          );
        });

    const trip = {
      uuid: tripUUID,
      tripInfo: {
        id: isTripCreated.id,
        startTime: isTripCreated.startTime,
        uuid: isTripCreated.tripId,
        tariffId: isTripCreated.tariffId,
        paused: false,
        processPaymentId: paymentStartDeposit.id,
        pricing: {
          minute: tariff.minuteCost,
          pause: tariff.pauseCost,
          board: tariff.boardingCost,
        },
        pauseIntervals: [],
        scooter: {
          scooter: updateScooterStatus,
          rightechScooter: scooterRes.rightechScooter,
        },
        geofencingStatus: 'GOOD',
        distanceTraveled: 0,
        deviceProps: {
          engineStatus: 'POWERON',
        },
      },
    };

    await this.cacheManager.set(trip.uuid, trip, CACHE_TTL);

    return trip;
  }

  async getActiveTrips(userId: number) {
    const activeTrips: any[] = await this.dbService.activeTrip
      .findMany({
        where: { userId: userId },
      })
      .catch((err) => {
        this.logger.error(err);
        return [];
      });

    if (activeTrips.length === 0) return [];

    const cachedTrips: IActiveTripRoot[] = [];

    for (const trip of activeTrips) {
      const cachedTrip = await this.cacheManager.get<IActiveTripRoot>(
        trip.tripUUID,
      );
      if (cachedTrip) {
        cachedTrips.push(cachedTrip);
      }
    }

    return cachedTrips;
  }

  async end(dto: EndTripProcessDto) {
    const cachedTrip: IActiveTripRoot = await this.cacheManager.get(
      dto.tripUUID,
    );

    const tripCoast = this.calcTripCost(cachedTrip);

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
        bonusesUsed: 0,
        price: tripCoast,
        distance: cachedTrip.tripInfo.distanceTraveled,
      },
    });

    const scooter: Scooter = await this.scooterService.findOne(trip.scooterId);

    await this.scooterCommandHandlerIOT.sendCommand(
      scooter.deviceIMEI,
      DEVICE_COMMANDS.LOCK,
    );

    if (!trip) {
      throw new BadRequestException(
        `Не удалось завершить поездку с id: ${dto.tripId}`,
      );
    }

    // const cachedTrip: IActiveTripRoot = await this.cacheManager.get(
    //   dto.tripUUID,
    // );

    const copy = Object.assign({}, cachedTrip);

    const backUserDeposit = await this.acquiringService.cancelPayment(
      copy.tripInfo.processPaymentId,
    );

    if (!backUserDeposit) {
      throw new BadRequestException('Не удалось вернуть залог');
    }

    await this.cacheManager.del(dto.tripUUID);

    const getPackets: any[] = await getScooterPackets(
      scooter.deviceIMEI,
      trip.startTime.toISOString(),
      trip.endTime.toISOString(),
    );

    if (!getPackets) {
      throw new BadRequestException('Не удалось получить пакеты');
    }

    const coordinates = getPackets.map((p) => {
      return {
        lat: p.lat,
        lon: p.lon,
      };
    });

    this.dbService.trip
      .update({
        where: { id: dto.tripId },
        data: {
          coordinates: JSON.stringify(coordinates),
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return 'Не удалось сохранить координаты';
      });

    return copy;
  }

  async pauseOn(activeTripUUID: string) {
    const trip = await this.cacheManager.get<IActiveTripRoot>(activeTripUUID);

    if (!trip) {
      throw new BadRequestException('Поездки не существует');
    }

    const shutDownEngine = await this.scooterCommandHandlerIOT.sendCommand(
      trip.tripInfo.scooter.scooter.deviceIMEI,
      DEVICE_COMMANDS.SHUT_DOWN_ENGINE,
    );

    if (!shutDownEngine) {
      throw new BadRequestException('Не удалось заглушить самокат');
    }

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

    if (!trip) {
      throw new BadRequestException('Поездки не существует');
    }

    const startEngine = await this.scooterCommandHandlerIOT.sendCommand(
      trip.tripInfo.scooter.scooter.deviceIMEI,
      DEVICE_COMMANDS.START_ENGINE,
    );

    if (!startEngine) {
      throw new BadRequestException('Не удалось завести самокат');
    }

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

  async getUpdatedTripInfo(tripUUID: string) {
    const trip = await this.cacheManager.get<IActiveTripRoot>(tripUUID);
    if (!trip) {
      throw new BadRequestException(
        'Не удалось получить информацию о скутере т.к поездки ' +
          tripUUID +
          ' не существует',
      );
    }

    const scooter = await this.scooterService.findOneMobile(
      trip.tripInfo.scooter.scooter.deviceId,
    );

    const packets = await this.getPer30SecPackets(
      scooter.scooter.deviceIMEI,
      trip.tripInfo.startTime,
    );

    const updatedTrip = Object.assign({}, trip);
    updatedTrip.tripInfo.scooter = scooter;

    if (packets) {
      const distance = this.calcTripTotalDistance(packets);
      updatedTrip.tripInfo.distanceTraveled = distance;

      const geofencingStatus = await this.getGeofencingTripStatus(
        packets[packets.length - 1].lat,
        packets[packets.length - 1].lon,
      );

      if (
        geofencingStatus === 'TRAVEL_BAN' &&
        updatedTrip.tripInfo.deviceProps.engineStatus === 'POWERON'
      ) {
        await this.scooterCommandHandlerIOT.sendCommand(
          scooter.scooter.deviceIMEI,
          DEVICE_COMMANDS.SHUT_DOWN_ENGINE,
        );
        updatedTrip.tripInfo.deviceProps.engineStatus = 'POWEROFF';
      } else {
        updatedTrip.tripInfo.deviceProps.engineStatus = 'POWERON';
        await this.scooterCommandHandlerIOT.sendCommand(
          scooter.scooter.deviceIMEI,
          DEVICE_COMMANDS.START_ENGINE,
        );
      }

      updatedTrip.tripInfo.geofencingStatus = geofencingStatus;
    }

    await this.cacheManager.set(tripUUID, updatedTrip, CACHE_TTL);

    return updatedTrip;
  }

  async saveTripPhoto(tripId: number, photo: string) {
    const trip = await this.dbService.trip.findFirst({ where: { id: tripId } });
    if (!trip) {
      throw new BadRequestException(
        `Не удалось сохранить фото поездки ${tripId}. Поездки не существует`,
      );
    }

    const path = `uploads/images/trips/${trip.tripId}/photo/image.png`;

    const isFileSaved = await this.saveFile(photo, path);
    if (!isFileSaved) {
      throw new BadRequestException('Ожидалось photo формата base64');
    }

    const [isTripUpdated] = await this.dbService
      .$transaction([
        this.dbService.trip.update({
          where: { id: trip.id },
          data: {
            photo: path,
          },
        }),
      ])
      .catch((err) => {
        this.logger.error(err);
        this.removeFile(trip.tripId);
        throw new BadRequestException(
          `Не удалось сохранить фото поездки ${tripId}. Ошибка при обновлении`,
        );
      });

    return isTripUpdated;
  }

  private calcTripCost(trip: IActiveTripRoot) {
    const startTime = new Date(trip.tripInfo.startTime);
    const endTime = new Date();

    const tripDurationMillis = endTime.getTime() - startTime.getTime();
    const tripDurationMinutes = Math.ceil(tripDurationMillis / (1000 * 60));

    let tripCost = tripDurationMinutes * trip.tripInfo.pricing.minute;

    if (trip.tripInfo.pauseIntervals.length) {
      for (const pause of trip.tripInfo.pauseIntervals) {
        if (!pause.start || !pause.end) return;

        const pauseStart = new Date(pause.start);
        const pauseEnd = new Date(pause.end);
        const pauseDurationMillis = pauseEnd.getTime() - pauseStart.getTime();
        const pauseDurationMinutes = Math.ceil(
          pauseDurationMillis / (1000 * 60),
        );
        tripCost -= pauseDurationMinutes * trip.tripInfo.pricing.minute;
        tripCost += pauseDurationMinutes * trip.tripInfo.pricing.pause;
      }

      return tripCost;
    } else {
      return tripCost;
    }
  }

  private async getPer30SecPackets(objectId: string, startTime: string) {
    const from = new Date(startTime);
    const to = new Date();
    const res: any[] = await getScooterPackets(
      objectId,
      from.toISOString(),
      to.toISOString(),
    );

    const packets = res
      .filter((p) => p.lat !== undefined && p.lon !== undefined)
      .map((p) => {
        return {
          lat: p.lat,
          lon: p.lon,
        };
      });

    if (packets.length === 0) {
      return null;
    }

    return packets;
  }

  private calcTripDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const latitude1Rad = (lat1 * Math.PI) / 180; // Latitude 1 in radians
    const latitude2Rad = (lat2 * Math.PI) / 180; // Latitude 2 in radians
    const deltaLatitudeRad = ((lat2 - lat1) * Math.PI) / 180; // Difference in latitude in radians
    const deltaLongitudeRad = ((lon2 - lon1) * Math.PI) / 180; // Difference in lon

    const earthRadiusMeters = 6371e3;

    const a =
      Math.sin(deltaLatitudeRad / 2) * Math.sin(deltaLatitudeRad / 2) +
      Math.cos(latitude1Rad) *
        Math.cos(latitude2Rad) *
        Math.sin(deltaLongitudeRad / 2) *
        Math.sin(deltaLongitudeRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = earthRadiusMeters * c;
    return distance;
  }

  private calcTripTotalDistance(coords: { lat: number; lon: number }[]) {
    let totalDistance = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const lat1 = coords[i].lat;
      const lon1 = coords[i].lon;
      const lat2 = coords[i + 1].lat;
      const lon2 = coords[i + 1].lon;
      totalDistance += this.calcTripDistance(lat1, lon1, lat2, lon2);
    }
    return totalDistance;
  }

  async getGeofencingTripStatus(
    lat: number,
    lon: number,
  ): Promise<GofencingStatus> {
    const zones = await this.geofenceService.getGeofences();

    for (const zone of zones) {
      if (!zone.coordinates) return;
      if (zone.type.slug !== 'notScooters') return;
      if (zone.type.drawType === 'CIRCLE') return;

      const zoneCoords = JSON.parse(zone.coordinates);
      const coords: any[] = this.convertToTurfFormat(zoneCoords);
      coords.push(coords[0]);
      const polygon = turf.polygon(coords);

      if (turf.booleanPointInPolygon([lat, lon], polygon)) {
        if (zone.type.slug === 'notScooters') {
          return 'TRAVEL_BAN';
        }
      }
    }
    return 'GOOD';
  }

  private convertToTurfFormat(coords) {
    return coords.map((coord) => [coord.lng, coord.lat]);
  }

  private removeFile(tripId: string) {
    fs.rmSync(`uploads/images/trips/${tripId}`, {
      recursive: true,
    });
  }

  private async saveFile(photo: string, entityPath: string) {
    const base64String = photo;

    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      return false;
    }
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = entityPath;

    const directoryPath = path.dirname(filePath);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
    return true;
  }
}
