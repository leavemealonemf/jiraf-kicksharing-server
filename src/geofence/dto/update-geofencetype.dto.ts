export class UpdateGeofenceTypeDto {
  type: {
    canParking: boolean;
    canRiding: boolean;
    description: string;
    colorHex: string;
    isParkingFine: boolean;
    isScooterBehavior: boolean;
    noiceToTheClient: boolean;
  };
  params: {
    zoneTimeCondition: string;
    parkingFinePrice: number;
    speedReduction: number;
    notificationMessage: string;
  };
}
