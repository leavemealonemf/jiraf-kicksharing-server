import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Debt, ErpUser, Fine, Trip } from '@prisma/client';
import { DbService } from 'src/db/db.service';
import { TripService } from 'src/trip/trip.service';

type ReportEntities = {
  trips: Trip[];
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

  async report(erpUser: ErpUser) {
    const isAccess = this.checkUserPermission(erpUser);
    if (!isAccess) {
      throw new BadRequestException('У Вас нет доступа к отчетности');
    }

    const entities = await this.getGroupReportEntities(erpUser);
    const entitiesTotalAmount = this.calculateTotalAmount(entities);
    const entitiesAmountOfCharges = this.caclulateAmountOfCharges(entities);
    const franchiseeRevenue = this.calculateFranchiseeRevenue(entities);
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
  ): Promise<ReportEntities> {
    const { trips, fines, debts } = await this.dbService.$transaction(
      async () => {
        const trips = await this.dbService.trip
          .findMany({
            where: {
              scooter: {
                franchiseId: erpUser.franchiseEmployeeId,
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
            where: { initiatorId: erpUser.franchiseEmployeeId },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        const debts = await this.dbService.debt
          .findMany({
            where: { initiatorId: erpUser.franchiseEmployeeId },
          })
          .catch((err) => {
            this.logger.error(err);
          });

        return { trips, fines, debts };
      },
    );

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
