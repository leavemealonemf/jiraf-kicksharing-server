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
import { UserService } from 'src/user/user.service';
import * as fs from 'fs';
import * as path from 'path';
import { AcquiringService } from 'src/acquiring/acquiring.service';
import { Scooter, User } from '@prisma/client';
import { PaymentMethodService } from 'src/payment-method/payment-method.service';
import { paymentType } from 'src/acquiring/dtos';
import { ScooterCommandHandler } from 'libs/IoT/scooter/handlers';
import { DEVICE_COMMANDS } from 'libs/IoT/scooter/commands';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async start(dto: StartTripProcessDto, user: User) {
    const userDb = await this.userService.findOneByUUID(user.clientId);

    if (!userDb.activePaymentMethod) {
      throw new BadRequestException('Отсутсвует активный платежный метод');
    }

    const paymentMethod = await this.paymentMethodService.getUserPaymentMethod(
      userDb.id,
      userDb.activePaymentMethod,
    );

    const scooterRes = await this.scooterService.findOneMobile(dto.scooterId);

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

    const cachedTrip: IActiveTripRoot = await this.cacheManager.get(
      dto.tripUUID,
    );

    const copy = Object.assign({}, cachedTrip);

    const backUserDeposit = await this.acquiringService.cancelPayment(
      copy.tripInfo.processPaymentId,
    );

    if (!backUserDeposit) {
      throw new BadRequestException('Не удалось вернуть залог');
    }

    await this.cacheManager.del(dto.tripUUID);

    return copy;
  }

  async pauseOn(activeTripUUID: string) {
    const trip = await this.cacheManager.get<IActiveTripRoot>(activeTripUUID);

    if (!trip) {
      throw new BadRequestException('Поездки не существует');
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
