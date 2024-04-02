export interface IActiveTripRoot {
  uuid: string;
  tripInfo: IActiveTrip;
}

type TripPricing = {
  minute: number;
  pause: number;
};

type PauseIntervals = {
  start: string | null;
  end: string | null;
};

export interface IActiveTrip {
  id: number;
  startTime: string;
  uuid: string;
  tariffId: number;
  pricing: TripPricing;
  scooter: Scooter;
  paused: boolean;
  pauseIntervals?: PauseIntervals[];
}

export interface Scooter {
  scooter: object;
  rightechScooter: object;
}
