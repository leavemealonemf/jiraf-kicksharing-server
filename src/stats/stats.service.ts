import { Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { TripService } from 'src/trip/trip.service';

@Injectable()
export class StatsService {
  private readonly logger = new Logger();

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
}
