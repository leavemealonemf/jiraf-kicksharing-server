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
import {
  AllTimeSpeedLimit,
  GofencingStatus,
  IActiveTripRoot,
  ScheduleSpeedLimit,
  ScheduleTimeInterval,
} from './interfaces';
import { UserService } from 'src/user/user.service';
import * as fs from 'fs';
import * as path from 'path';
import { AcquiringService } from 'src/acquiring/acquiring.service';
import { Geofence, Scooter, User } from '@prisma/client';
import { PaymentMethodService } from 'src/payment-method/payment-method.service';
import { AcquiringProcessPaymentDto, paymentType } from 'src/acquiring/dtos';
import {
  ScooterCommandHandler,
  getScooterPackets,
} from 'libs/IoT/scooter/handlers';
import {
  DEVICE_COMMANDS,
  DEVICE_COMMANDS_DYNAMIC,
} from 'libs/IoT/scooter/commands';
import { GeofenceService } from 'src/geofence/geofence.service';
import * as turf from '@turf/turf';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsService } from 'src/payments/payments.service';
import { isArray } from 'class-validator';

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
    private readonly paymentsService: PaymentsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async start(dto: StartTripProcessDto, user: User) {
    const scooterRes = await this.scooterService.findOneMobile(dto.scooterId);

    if (scooterRes.scooter.rented) {
      throw new BadRequestException('Не удалось начать поездку. Самокат занят');
    }

    const userDb = await this.userService.findOneByUUID(user.clientId);

    if (!userDb.activePaymentMethod) {
      throw new BadRequestException('Отсутствует активный платежный метод');
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
        value: 300,
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
            include: {
              model: true,
            },
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

  async end(dto: EndTripProcessDto, userId: string) {
    const user = await this.userService.findOneByUUID(userId);

    const cachedTrip: IActiveTripRoot = await this.cacheManager.get(
      dto.tripUUID,
    );

    const tripCoast = this.calcTripCost(cachedTrip);

    let balanceSpent = 0;
    let cardSpent = 0;

    if (user.balance > 0) {
      balanceSpent = user.balance;
      cardSpent = tripCoast - user.bonuses;
    } else {
      cardSpent = tripCoast;
    }

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
        bonusesUsed: balanceSpent,
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

    this.dbService.activeTrip
      .delete({ where: { tripUUID: copy.uuid } })
      .catch((err) => {
        this.logger.error(err);
      });

    return copy;
  }

  async endTripTest(dto: EndTripProcessDto, userUUID: any) {
    const user = await this.userService.findOneByUUID(userUUID);

    const cachedTrip: IActiveTripRoot = await this.cacheManager.get(
      dto.tripUUID,
    );

    const tripCoast = this.calcTripCost(cachedTrip);
    const tripCoastPayment = tripCoast + cachedTrip.tripInfo.pricing.board;

    let balanceSpent = 0;
    let cardSpent = 0;

    if (user.balance > 0) {
      if (user.balance >= tripCoastPayment) {
        balanceSpent = tripCoastPayment;
        cardSpent = 0;
      } else {
        balanceSpent = user.balance;
        cardSpent = tripCoastPayment - user.balance;
      }
    } else {
      cardSpent = tripCoastPayment;
    }

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
        bonusesUsed: balanceSpent,
        price: tripCoast,
        distance: cachedTrip.tripInfo.distanceTraveled,
        user: {
          update: {
            balance: {
              decrement: balanceSpent,
            },
          },
        },
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

    // Списание и сохранение платежа

    const paymentMethod = await this.paymentMethodService.getUserPaymentMethod(
      user.id,
      user.activePaymentMethod,
    );

    const paymentData: AcquiringProcessPaymentDto = {
      description: `Самокат №${cachedTrip.tripInfo.scooter.scooter.deviceId}`,
      paymentMethodId: paymentMethod.id,
      paymentMethodStringId: paymentMethod.paymentId,
      type: paymentType.CARD,
      value: tripCoastPayment,
      metadata: {
        type: 'TRIP',
        description: 'Списание за поездку',
        tripBonusesUsed: balanceSpent,
      },
    };

    if (cardSpent > 0) {
      const payment = await this.acquiringService.processPayment(paymentData);

      if (!payment) {
        this.logger.log('НЕ УДАЛОСЬ СПИСАТЬ ДЕНЬГИ ЗА ПОЕЗДКУ!');
        this.logger.log('НЕ УДАЛОСЬ СПИСАТЬ ДЕНЬГИ ЗА ПОЕЗДКУ!');
        this.logger.log('НЕ УДАЛОСЬ СП ИСАТЬ ДЕНЬГИ ЗА ПОЕЗДКУ!');
        this.logger.log('НЕ УДАЛОСЬ СПИСАТЬ ДЕНЬГИ ЗА ПОЕЗДКУ!');
      }
    }

    const savedPayment = await this.paymentsService.savePayment(
      paymentData,
      user.id,
    );

    if (!savedPayment) {
      this.logger.log('НЕ УДАЛОСЬ СОХРАНИТЬ ПЛАТЕЖ ПОЕЗДКИ!');
      this.logger.log('НЕ УДАЛОСЬ СОХРАНИТЬ ПЛАТЕЖ ПОЕЗДКИ!');
      this.logger.log('НЕ УДАЛОСЬ СОХРАНИТЬ ПЛАТЕЖ ПОЕЗДКИ!');
      this.logger.log('НЕ УДАЛОСЬ СОХРАНИТЬ ПЛАТЕЖ ПОЕЗДКИ!');
    }

    // \Списание и сохранение платежа/

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

    const updatedTrip = await this.dbService.trip
      .update({
        where: { id: dto.tripId },
        data: {
          coordinates: JSON.stringify(coordinates),
        },
        include: {
          tariff: true,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return 'Не удалось сохранить координаты';
      });

    this.dbService.activeTrip
      .delete({ where: { tripUUID: copy.uuid } })
      .catch((err) => {
        this.logger.error(err);
      });

    return {
      trip: copy,
      updatedTrip: updatedTrip,
      payment: savedPayment,
    };
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

  // GET TRIP INFO INCLUDES GEOFENCING FEATURES
  // GET TRIP INFO INCLUDES GEOFENCING FEATURES
  // GET TRIP INFO INCLUDES GEOFENCING FEATURES

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
        packets[0].lat, // first packet lat by index
        packets[0].lon, // first packet lon by index
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

      if (geofencingStatus.split('.')[0] === 'ALL_TIME_SPEED_LIMIT') {
        const speedValue = geofencingStatus.split('.')[1];
        await this.scooterCommandHandlerIOT.sendCommand(
          scooter.scooter.deviceIMEI,
          DEVICE_COMMANDS_DYNAMIC[speedValue],
        );
      } else {
        await this.scooterCommandHandlerIOT.sendCommand(
          scooter.scooter.deviceIMEI,
          DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_25,
        );
      }

      if (geofencingStatus.split('.')[0] === 'SCHEDULE_SPEED_LIMIT') {
        const speedValue = geofencingStatus.split('.')[1];
        await this.scooterCommandHandlerIOT.sendCommand(
          scooter.scooter.deviceIMEI,
          DEVICE_COMMANDS_DYNAMIC[speedValue],
        );
      } else {
        await this.scooterCommandHandlerIOT.sendCommand(
          scooter.scooter.deviceIMEI,
          DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_25,
        );
      }

      updatedTrip.tripInfo.geofencingStatus = geofencingStatus;
    }

    await this.cacheManager.set(tripUUID, updatedTrip, CACHE_TTL);

    return updatedTrip;
  }

  // PARKING LOGIC
  // PARKING LOGIC
  // PARKING LOGIC

  async canParking(
    userLatitude: number,
    userLongitude: number,
    scooterLatitude: number,
    scooterLongitude: number,
  ): Promise<any> {
    const geofences: any[] = await this.geofenceService.getGeofences();

    for (const geofence of geofences) {
      this.logger.log(geofence.type.drawType);

      if (geofence.type.drawType !== 'CIRCLE') continue;

      const coordinates = JSON.parse(geofence.coordinates);

      if (!isArray(coordinates)) continue;

      const turfCoordinates: any[] = this.convertToTurfFormat(coordinates);
      turfCoordinates.push(turfCoordinates[0]);
      const polygon = turf.polygon([turfCoordinates]);

      const isUserInParking = this.checkIsUserInParking(
        userLatitude,
        userLongitude,
        polygon,
      );

      const isScooterInParking = this.checkIsScooterInParking(
        scooterLatitude,
        scooterLongitude,
        polygon,
      );

      return {
        isUserInParking: isUserInParking,
        isScooterInParking: isScooterInParking,
      };
    }
  }

  private checkIsUserInParking(
    userLatitude: number,
    userLongitude: number,
    polygon: any,
  ) {
    if (turf.booleanPointInPolygon([userLatitude, userLongitude], polygon)) {
      this.logger.log('CAN PARKING by user value');
      return true;
    } else {
      this.logger.log('NO PARKING by user value');
      return false;
    }
  }

  private checkIsScooterInParking(
    scooterLatitude: number,
    scooterLongitude: number,
    polygon: any,
  ) {
    if (
      turf.booleanPointInPolygon([scooterLatitude, scooterLongitude], polygon)
    ) {
      this.logger.log('CAN PARKING by scooter value');
      return true;
    } else {
      this.logger.log('NO PARKING by scooter value');
      return false;
    }
  }

  // OTHER TRIP ROUTINE
  // OTHER TRIP ROUTINE
  // OTHER TRIP ROUTINE

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateTripInfoBackground() {
    const activeTrips = await this.dbService.activeTrip.findMany();
    for (const activeTrip of activeTrips) {
      const cachedTrip = await this.cacheManager.get<IActiveTripRoot>(
        activeTrip.tripUUID,
      );
      if (!cachedTrip) return;
      const scooter = await this.scooterService.findOneMobile(
        cachedTrip.tripInfo.scooter.scooter.deviceId,
      );

      const packets = await this.getPer30SecPackets(
        scooter.scooter.deviceIMEI,
        cachedTrip.tripInfo.startTime,
      );

      for (const packet of packets) {
        console.log(packet);
      }

      const updatedTrip = Object.assign({}, cachedTrip);
      updatedTrip.tripInfo.scooter = scooter;

      if (packets) {
        const distance = this.calcTripTotalDistance(packets);
        updatedTrip.tripInfo.distanceTraveled = distance;

        const geofencingStatus = await this.getGeofencingTripStatus(
          packets[0].lat, // first packet lat by index
          packets[0].lon, // first packet lon by index
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

        if (geofencingStatus.split('.')[0] === 'ALL_TIME_SPEED_LIMIT') {
          const speedValue = geofencingStatus.split('.')[1];
          await this.scooterCommandHandlerIOT.sendCommand(
            scooter.scooter.deviceIMEI,
            DEVICE_COMMANDS_DYNAMIC[speedValue],
          );
        } else {
          await this.scooterCommandHandlerIOT.sendCommand(
            scooter.scooter.deviceIMEI,
            DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_25,
          );
        }

        if (geofencingStatus.split('.')[0] === 'SCHEDULE_SPEED_LIMIT') {
          const speedValue = geofencingStatus.split('.')[1];
          await this.scooterCommandHandlerIOT.sendCommand(
            scooter.scooter.deviceIMEI,
            DEVICE_COMMANDS_DYNAMIC[speedValue],
          );
        } else {
          await this.scooterCommandHandlerIOT.sendCommand(
            scooter.scooter.deviceIMEI,
            DEVICE_COMMANDS.SET_SPEED_LIMIT_NORMAL_MODE_25,
          );
        }

        updatedTrip.tripInfo.geofencingStatus = geofencingStatus;
      }

      await this.cacheManager.set(cachedTrip.uuid, updatedTrip, CACHE_TTL);
    }
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

  private async getGeofencingTripStatus(
    lat: number,
    lon: number,
  ): Promise<GofencingStatus> {
    const zones = await this.geofenceService.getGeofences();

    for (const zone of zones) {
      if (!zone.coordinates) return;
      if (zone.type.drawType === 'CIRCLE') return;

      const zoneCoords = JSON.parse(zone.coordinates);
      const coords: any[] = this.convertToTurfFormat(zoneCoords);
      coords.push(coords[0]);
      const polygon = turf.polygon([coords]);

      if (turf.booleanPointInPolygon([lat, lon], polygon)) {
        if (zone.type.slug === 'notScooters') {
          this.logger.log('TRAVEL_BAN');
          return 'TRAVEL_BAN';
        }
        if (zone.type.slug === 'speedLimitAllDay') {
          return this.zoneSpeedLimitAllTimeStatus(zone.allTimeSpeedLimit);
        }
        if (zone.type.slug === 'speedLimitSchedule') {
          const timeInterval = this.getCurrentScheduleTimeInterval(zone);
          if (timeInterval === 'firstInterval') {
            return this.zoneSpeedLimitScheduleStatus(zone.firstSpeedLimit);
          } else if (timeInterval === 'secondInterval') {
            return this.zoneSpeedLimitScheduleStatus(zone.secondSpeedLimit);
          } else {
            return 'SCHEDULE_SPEED_LIMIT.25';
          }
        }
      } else {
        return 'GOOD';
      }
    }
    return 'GOOD';
  }

  private convertToTurfFormat(coords) {
    return coords.map((coord) => [coord.lat, coord.lng]);
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

  private zoneSpeedLimitAllTimeStatus(value: number): AllTimeSpeedLimit {
    switch (value) {
      case 5:
        return 'ALL_TIME_SPEED_LIMIT.5';
      case 10:
        return 'ALL_TIME_SPEED_LIMIT.10';
      case 15:
        return 'ALL_TIME_SPEED_LIMIT.15';
      case 20:
        return 'ALL_TIME_SPEED_LIMIT.20';
      default:
        return 'ALL_TIME_SPEED_LIMIT.25';
    }
  }

  private zoneSpeedLimitScheduleStatus(value: number): ScheduleSpeedLimit {
    switch (value) {
      case 5:
        return 'SCHEDULE_SPEED_LIMIT.5';
      case 10:
        return 'SCHEDULE_SPEED_LIMIT.10';
      case 15:
        return 'SCHEDULE_SPEED_LIMIT.15';
      case 20:
        return 'SCHEDULE_SPEED_LIMIT.20';
      case 25:
        return 'SCHEDULE_SPEED_LIMIT.25';
      default:
        return 'SCHEDULE_SPEED_LIMIT.25';
    }
  }

  private getCurrentScheduleTimeInterval(zone: Geofence): ScheduleTimeInterval {
    const currentDate = new Date();
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();

    const parseInterval = (start: any, end: any) => {
      const startTime =
        Number(start.split(':')[0]) * 60 + Number(start.split(':')[1]);
      const endTime =
        Number(end.split(':')[0]) * 60 + Number(end.split(':')[1]);
      return { startTime, endTime };
    };

    const firstInterval = parseInterval(
      zone.firtsTimePeriodStart,
      zone.firstTimePeriodEnd,
    );

    const secondInterval = parseInterval(
      zone.secondTimePeriodStart,
      zone.secondTimePeriodEnd,
    );

    if (secondInterval.endTime < secondInterval.startTime) {
      secondInterval.endTime += 24 * 60;
    }

    if (
      currentTime >= firstInterval.startTime &&
      currentTime <= firstInterval.endTime
    ) {
      return 'firstInterval';
    } else if (
      currentTime >= secondInterval.startTime &&
      currentTime <= secondInterval.endTime
    ) {
      return 'secondInterval';
    } else {
      return 'noInterval';
    }
  }
}
