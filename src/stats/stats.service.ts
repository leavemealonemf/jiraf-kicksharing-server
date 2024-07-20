import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Debt, ErpUser, Fine, Trip } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { TripService } from 'src/trip/trip.service';
import { v4 } from 'uuid';

interface IReportTripStruct extends Trip {
  debt: Debt;
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

  async report(erpUser: ErpUser, start: string, end: string) {
    const isAccess = this.checkUserPermission(erpUser);
    if (!isAccess) {
      throw new BadRequestException('У Вас нет доступа к отчетности');
    }

    const entities = await this.getGroupReportEntities(erpUser, start, end);
    console.log(entities);
    const entitiesTotalAmount = this.calculateTotalAmount(entities);
    const entitiesAmountOfCharges = this.caclulateAmountOfCharges(entities);
    const franchiseeRevenue = this.calculateFranchiseeRevenue(entities);
    const averageTripCountValue =
      entities.trips.reduce((acc) => acc + 1, 0) / entities.trips.length;
    const averageTripPriceValue =
      entities.trips.reduce(
        (acc, val) => acc + (val.price - val.bonusesUsed),
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
        averageTripsCount: averageTripCountValue,
        averageTripsPrice: averageTripPriceValue,
        categories,
      },
    };
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
    return trips.reduce((acc, val) => acc + (val.price - val.bonusesUsed), 0);
  }

  private groupEntitiesByCategories(entities: ReportEntities) {
    const categories = {
      trips: {
        count: entities.trips.length,
        paidMoney: this.calucateMoneySpentForTrip(entities.trips),
        paidBonuses: this.calucateBonusesSpentForTrip(entities.trips),
        notPaid: this.calucateDebtsForTrip(entities.trips),
      },
      fines: {
        count: entities.fines.length,
        sum: this.calculateFinesOrDebtsTotalSum(entities.fines),
      },
      debts: {
        count: entities.debts.length,
        sum: this.calculateFinesOrDebtsTotalSum(entities.debts),
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
      (acc, current) => acc + current.price - current.bonusesUsed,
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
      (acc, current) => acc + current.price - current.bonusesUsed,
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
      (acc, current) => acc + current.price,
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

  private checkUserPermission(erpUser: ErpUser): boolean {
    if (!erpUser) return false;
    if (erpUser.role === 'FRANCHISE' && erpUser.franchiseEmployeeId) {
      return true;
    }

    return false;
  }
}
