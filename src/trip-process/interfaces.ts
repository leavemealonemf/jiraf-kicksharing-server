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

export type AllTimeSpeedLimit =
  | 'ALL_TIME_SPEED_LIMIT.5'
  | 'ALL_TIME_SPEED_LIMIT.10'
  | 'ALL_TIME_SPEED_LIMIT.15'
  | 'ALL_TIME_SPEED_LIMIT.20'
  | 'ALL_TIME_SPEED_LIMIT.25';

export type ScheduleSpeedLimit =
  | 'SCHEDULE_SPEED_LIMIT.5'
  | 'SCHEDULE_SPEED_LIMIT.10'
  | 'SCHEDULE_SPEED_LIMIT.15'
  | 'SCHEDULE_SPEED_LIMIT.20'
  | 'SCHEDULE_SPEED_LIMIT.25';

export type GofencingStatus =
  | ScheduleSpeedLimit
  | AllTimeSpeedLimit
  | 'OUT_OF_ZONE'
  | 'GOOD'
  | 'TRAVEL_BAN';

export type ScheduleTimeInterval =
  | 'noInterval'
  | 'firstInterval'
  | 'secondInterval';

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
