export interface IActiveTripRoot {
  uuid: string;
  tripInfo: IActiveTrip;
}

type TripPricing = {
  minute: number;
  pause: number;
  board: number;
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
  processPaymentId: string;
  paused: boolean;
  pauseIntervals?: PauseIntervals[];
}

export interface Scooter {
  scooter: {
    deviceId: string;
    deviceIMEI: string;
  };
  rightechScooter: object;
}
