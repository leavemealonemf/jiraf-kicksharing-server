import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Debt, ErpUser, Fine, Tariff, Trip } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { TripService } from 'src/trip/trip.service';
import { v4 } from 'uuid';

interface IReportTripStruct extends Trip {
  debt: Debt;
  tariff: Tariff;
}

type FinesOrDebts = Fine[] | Debt[];

type ReportEntities = {
  trips: IReportTripStruct[];
  fines: Fine[];
  debts: Debt[];
};

type EntitiesTotalAmount = {
  tripsTotalAmount: number;
  finesTotalAmount: number;
  debtsTotalAmount: number;
};

type EntitiesAmountOfCharges = {
  tripsAmountOfCharges: number;
  finesAmountOfCharges: number;
  debtsAmountOfCharges: number;
};

type EntitiesFranchiseeRevenue = {
  tripsFranchiseeRevenue: number;
  finesFranchiseeRevenue: number;
  debtsFranchiseeRevenue: number;
};

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly tripService: TripService,
  ) {}

  async getStats(interval: string, start: string, end: string) {
    const trips = await this.tripService.findAll(interval, start, end);

    const totalTrips = trips.length;
    const totalPrice = trips.reduce(
      (acc, val) => acc + (val.price + val.tariff.boardingCost),
      0,
    );
    const midTrips = trips.reduce((acc) => acc + 1, 0) / trips.length;
    const midTripPrice =
      trips.reduce((acc, val) => acc + val.price, 0) / trips.length;

    const moneyForTheTrips = trips.reduce((acc, val) => acc + val.price, 0);

    return {
      totalTrips,
      totalPrice,
      midTrips,
      midTripPrice,
      moneyForTheTrips,
    };
  }

  async report(
    erpUser: ErpUser,
    start: string,
    end: string,
    franchiseId: number,
  ) {
    const isAccess = this.checkUserPermission(erpUser);
    if (!isAccess) {
      throw new BadRequestException('У Вас нет доступа к отчетности');
    }

    const daysInterval = this.calculateDaysInterval(start, end);

    let entities;

    if (erpUser.role === 'ADMIN' || erpUser.role === 'EMPLOYEE') {
      entities = await this.getGroupReportEntitiesForAdmin(
        start,
        end,
        franchiseId,
      );
    } else {
      entities = await this.getGroupReportEntities(erpUser, start, end);
    }

    const entitiesTotalAmount = this.calculateTotalAmount(entities);
    const entitiesAmountOfCharges = this.caclulateAmountOfCharges(entities);
    const franchiseeRevenue = this.calculateFranchiseeRevenue(entities);
    const averageTripCountValue = Math.round(
      entities.trips.length / daysInterval,
    );

    const averageTripPriceValue =
      entities.trips.reduce(
        (acc, val) =>
          acc + (val.price - val.bonusesUsed + val.tariff.boardingCost),
        0,
      ) / entities.trips.length;

    const categories = this.groupEntitiesByCategories(entities);

    return {
      report: {
        id: v4(),
        totalTrips: entities.trips.length,
        totalSum: (
          entitiesTotalAmount.debtsTotalAmount +
          entitiesTotalAmount.finesTotalAmount +
          entitiesTotalAmount.tripsTotalAmount
        ).toFixed(2),
        chargesAmount: (
          entitiesAmountOfCharges.debtsAmountOfCharges +
          entitiesAmountOfCharges.finesAmountOfCharges +
          entitiesAmountOfCharges.tripsAmountOfCharges
        ).toFixed(2),
        franchiseRevenue: (
          franchiseeRevenue.debtsFranchiseeRevenue +
          franchiseeRevenue.finesFranchiseeRevenue +
          franchiseeRevenue.tripsFranchiseeRevenue
        ).toFixed(2),
        averageTripsCount: isNaN(averageTripCountValue)
          ? 0
          : averageTripCountValue,
        averageTripsPrice: isNaN(averageTripPriceValue)
          ? 0
          : averageTripPriceValue.toFixed(2),
        categories,
      },
    };
  }

  private calculateDaysInterval(start: string, end: string): number {
    const dayStart = new Date(start);
    const dayEnd = new Date(end);

    const diffInMilliseconds = dayEnd.getTime() - dayStart.getTime();

    // Переводим разницу из миллисекунд в дни
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
    const daysInterval = Math.round(Math.abs(diffInDays));

    if (isNaN(daysInterval)) return 1;

    if (daysInterval === 0) return 1;

    return daysInterval;
  }

  private calculateFinesOrDebtsTotalSum(entity: FinesOrDebts) {
    return entity.reduce((acc, val) => acc + val.price, 0);
  }

  private calucateDebtsForTrip(trips: IReportTripStruct[]) {
    const tripDebts = trips.filter(
      (x) => x.debt && x.debt.paidStatus === 'NOTPAID',
    );
    return tripDebts.reduce((acc, val) => acc + val.debt.price, 0);
  }

  private calucateBonusesSpentForTrip(trips: IReportTripStruct[]) {
    return trips.reduce((acc, val) => acc + val.bonusesUsed, 0);
  }

  private calucateMoneySpentForTrip(trips: IReportTripStruct[]) {
    return trips.reduce(
      (acc, val) =>
        acc + (val.price - val.bonusesUsed + val.tariff.boardingCost),
      0,
    );
  }

  private groupEntitiesByCategories(entities: ReportEntities) {
    const paidFines = entities.fines.filter((x) => x.paidStatus === 'PAID');
    const paidFinesSum = this.calculateFinesOrDebtsTotalSum(paidFines);

    const paidDebts = entities.debts.filter((x) => x.paidStatus === 'PAID');
    const paidDebtsSum = this.calculateFinesOrDebtsTotalSum(paidDebts);

    const categories = {
      trips: {
        count: entities.trips.length,
        paidMoney: this.calucateMoneySpentForTrip(entities.trips).toFixed(2),
        paidBonuses: this.calucateBonusesSpentForTrip(entities.trips).toFixed(
          2,
        ),
        notPaid: this.calucateDebtsForTrip(entities.trips).toFixed(2),
      },
      fines: {
        count: entities.fines.length,
        paidCount: paidFines.length,
        paidSum: isNaN(paidFinesSum) ? 0 : paidFinesSum.toFixed(2),
        totalSum: this.calculateFinesOrDebtsTotalSum(entities.fines).toFixed(2),
      },
      debts: {
        count: entities.debts.length,
        paidCount: paidDebts.length,
        paidSum: isNaN(paidDebtsSum) ? 0 : paidDebtsSum.toFixed(2),
        totalSum: this.calculateFinesOrDebtsTotalSum(entities.debts).toFixed(2),
      },
    };

    return categories;
  }

  private calculateFranchiseeRevenue({
    trips,
    debts,
    fines,
  }: ReportEntities): EntitiesFranchiseeRevenue {
    const tripsFranchiseeRevenue = trips.reduce(
      (acc, current) =>
        acc +
        (current.price - current.bonusesUsed + current.tariff.boardingCost),
      0,
    );
    const paidFines = fines.filter((x) => x.paidStatus === 'PAID');
    const finesFranchiseeRevenue = paidFines.reduce(
      (acc, current) => acc + current.price,
      0,
    );
    const paidDebts = debts.filter((x) => x.paidStatus === 'PAID');
    const debtsFranchiseeRevenue = paidDebts.reduce(
      (acc, current) => acc + current.price,
      0,
    );

    return {
      tripsFranchiseeRevenue,
      finesFranchiseeRevenue,
      debtsFranchiseeRevenue,
    };
  }

  private caclulateAmountOfCharges({
    trips,
    debts,
    fines,
  }: ReportEntities): EntitiesAmountOfCharges {
    const tripsAmountOfCharges = trips.reduce(
      (acc, current) =>
        acc +
        (current.price - current.bonusesUsed + current.tariff.boardingCost),
      0,
    );
    const paidFines = fines.filter((x) => x.paidStatus === 'PAID');
    const finesAmountOfCharges = paidFines.reduce(
      (acc, current) => acc + current.price,
      0,
    );
    const paidDebts = debts.filter((x) => x.paidStatus === 'PAID');
    const debtsAmountOfCharges = paidDebts.reduce(
      (acc, current) => acc + current.price,
      0,
    );

    return { tripsAmountOfCharges, finesAmountOfCharges, debtsAmountOfCharges };
  }

  private calculateTotalAmount({
    trips,
    fines,
    debts,
  }: ReportEntities): EntitiesTotalAmount {
    const tripsTotalAmount = trips.reduce(
      (acc, current) =>
        acc +
        (current.price + current.bonusesUsed + current.tariff.boardingCost),
      0,
    );
    const finesTotalAmount = fines.reduce(
      (acc, current) => acc + current.price,
      0,
    );
    const debtsTotalAmount = debts.reduce(
      (acc, current) => acc + current.price,
      0,
    );

    return { tripsTotalAmount, finesTotalAmount, debtsTotalAmount };
  }

  private async getGroupReportEntities(
    erpUser: ErpUser,
    start: string,
    end: string,
  ): Promise<ReportEntities> {
    const { trips, fines, debts } = await this.dbService.$transaction(
      async () => {
        const trips = await this.dbService.trip
          .findMany({
            where: {
              scooter: {
                franchiseId: erpUser.franchiseEmployeeId,
              },
              startTime: {
                gte: start,
                lte: end,
              },
            },
            include: {
              dept: true,
              tariff: true,
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        const fines = await this.dbService.fine
          .findMany({
            where: {
              initiatorId: erpUser.franchiseEmployeeId,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        const debts = await this.dbService.debt
          .findMany({
            where: {
              initiatorId: erpUser.franchiseEmployeeId,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        return { trips, fines, debts };
      },
    );

    // @ts-ignore
    return { trips, fines, debts };
  }

  private async getGroupReportEntitiesForAdmin(
    start: string,
    end: string,
    franhiseId: number,
  ): Promise<ReportEntities> {
    const franchise = await this.dbService.franchise
      .findFirst({
        where: { id: franhiseId },
      })
      .catch((err) => {
        this.logger.error(err);
      });

    if (!franchise) {
      throw new BadRequestException(
        'Не удалось получить франчайзи на которого формируем отчет',
      );
    }

    const { trips, fines, debts } = await this.dbService.$transaction(
      async () => {
        const trips = await this.dbService.trip
          .findMany({
            where: {
              scooter: {
                franchiseId: franhiseId,
              },
              startTime: {
                gte: start,
                lte: end,
              },
            },
            include: {
              dept: true,
              tariff: true,
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        const fines = await this.dbService.fine
          .findMany({
            where: {
              initiatorId: franhiseId,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        const debts = await this.dbService.debt
          .findMany({
            where: {
              initiatorId: franhiseId,
              createdAt: {
                gte: start,
                lte: end,
              },
            },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        return { trips, fines, debts };
      },
    );

    // @ts-ignore
    return { trips, fines, debts };
  }

  private checkUserPermission(erpUser: ErpUser): boolean {
    if (!erpUser) return false;

    if (erpUser.role === 'ADMIN' || erpUser.role === 'EMPLOYEE') return true;

    if (erpUser.role === 'FRANCHISE' && erpUser.franchiseEmployeeId) {
      return true;
    }

    return false;
  }
}
