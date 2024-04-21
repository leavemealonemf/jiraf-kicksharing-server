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

export type GofencingStatus =
  | 'SPEED_LIMIT'
  | 'ALL_TIME_SPEED_LIMIT'
  | 'OUT_OF_ZONE'
  | 'GOOD'
  | 'TRAVEL_BAN';

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
  distanceTraveled: number;
  geofencingStatus: GofencingStatus;
  deviceProps: {
    engineStatus: ScooterEngineStatus;
  };
}

type ScooterEngineStatus = 'POWERON' | 'POWEROFF';

export interface Scooter {
  scooter: {
    deviceId: string;
    deviceIMEI: string;
  };
  rightechScooter: object;
}
