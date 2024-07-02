import { ApiProperty } from '@nestjs/swagger';

class ScooterSettings {
  @ApiProperty({ default: 1000 })
  metersToRent: number;
  @ApiProperty({ default: 1500 })
  metersToBooking: number;
}

class CompanyClientSupportResources {
  @ApiProperty({ default: 'https:/t.me/giraffego_support' })
  tgLink: string;
}

class CompanyInformationResources {
  @ApiProperty({ default: 'https://go.giraffe-go.ru/' })
  site: string;
  @ApiProperty({ default: 'https://vk.ru/giraffegroup' })
  vkGroup: string;
  @ApiProperty({ default: 'https:/t.me/giraffego' })
  tgChannel: string;
  @ApiProperty({ default: 'https://instagram.com/giraffego' })
  instagram: string;
}

class CompanyLegalInformation {
  @ApiProperty({ default: 'https://giraffe-go.ru/agreement/' })
  offerUrl: string;
  @ApiProperty({ default: 'https://giraffe-go.ru/privacy/' })
  privacyPolicyUrl: string;
}

class CompanySettings {
  @ApiProperty({ default: 'Жираф GO' })
  name: string;

  @ApiProperty({ default: CompanyClientSupportResources })
  clientSupport: CompanyClientSupportResources;

  @ApiProperty({ default: CompanyInformationResources })
  informationResources: CompanyInformationResources;

  @ApiProperty({ default: CompanyLegalInformation })
  legalInformation: CompanyLegalInformation;
}

class TripParams {
  @ApiProperty({ default: 1 })
  tripCountLimit: number;
}

class TripBookingParams {
  @ApiProperty({ default: true })
  canBooking: boolean;
  @ApiProperty({ default: 1500 })
  metersToBooking: number;
  @ApiProperty({ default: 20 })
  timeBooking: number;
  @ApiProperty({ default: '#000' })
  cardColor: string;
}

class TripSettings {
  @ApiProperty({ default: TripParams })
  trips: TripParams;
  @ApiProperty({ default: TripBookingParams })
  booking: TripBookingParams;
}

class PromocodeReferalProgram {
  @ApiProperty({ default: false })
  active: boolean;
  @ApiProperty({ default: 55 })
  referalBonus: number;
}

class PromocodeSettings {
  @ApiProperty({ default: PromocodeReferalProgram })
  referalProgram: PromocodeReferalProgram;
}

export class CreateSettingDto {
  @ApiProperty({ default: ScooterSettings })
  scooterSettings: ScooterSettings;
  @ApiProperty({ default: CompanySettings })
  companySettings: CompanySettings;
  @ApiProperty({ default: TripSettings })
  tripSettings: TripSettings;
  @ApiProperty({ default: PromocodeSettings })
  promocodeSettings: PromocodeSettings;
}
