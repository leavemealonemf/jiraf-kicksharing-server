import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TripProcessService } from './trip-process.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { CurrentUser, Platforms } from '@common/decorators';
import { StartTripProcessDto } from './dto/start-trip-process.dto';
import { EndTripProcessDto } from './dto/end-trip-process.dto';
import {
  PauseOffTripProcessDto,
  PauseOnTripProcessDto,
  SaveTripPictureDto,
  CanParkingDto,
} from './dto';
import { TerminateTripDto } from './dto/terminate-trip.dto';

@ApiTags('Процесс поездки')
@ApiBearerAuth()
@Controller('trip-process')
export class TripProcessController {
  constructor(private readonly tripProcessService: TripProcessService) {}

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/start')
  async start(@Body() dto: StartTripProcessDto, @CurrentUser() user: any) {
    return this.tripProcessService.start(dto, user);
  }

  // @Post('/end')
  // async end(@Body() dto: EndTripProcessDto, @CurrentUser() user: any) {
  //   return this.tripProcessService.end(dto, user.clientId);
  // }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/end-test')
  async endTest(@Body() dto: EndTripProcessDto, @CurrentUser() user: any) {
    return await this.tripProcessService.endTripTest(dto, user.clientId);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Post('/emergency-trip-termination')
  async terminateTrip(@Body() dto: TerminateTripDto) {
    return await this.tripProcessService.terminateTrip(
      dto.tripId,
      dto.userUUID,
    );
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/can-parking')
  async canParking(@Body() dto: CanParkingDto) {
    return await this.tripProcessService.canParking(
      dto.userLatitude,
      dto.userLongitude,
      dto.scooterLatitude,
      dto.scooterLongitude,
    );
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Get('/active-trips')
  async getActiveTrips(@CurrentUser() user: any) {
    return this.tripProcessService.getActiveTrips(user.id);
  }

  // @Post('/test/geofencing')
  // async testGeofencingDevice(@Body() dto: TestGeofencingDto) {
  //   return await this.tripProcessService.getGeofencingTripStatus(
  //     dto.lat,
  //     dto.lon,
  //   );
  // }

  // @Get('/get-upd-trip-info/:tripUUID')
  // async getUpdatedTripInfo(
  //   @Param('tripUUID') tripUUID: string,
  //   @CurrentUser() user: any,
  // ) {
  //   return this.tripProcessService.getUpdatedTripInfo(tripUUID);
  // }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/pause-on')
  async pauseOn(@Body() dto: PauseOnTripProcessDto) {
    return this.tripProcessService.pauseOn(dto.activeTripUUID);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/pause-off')
  async pauseOff(@Body() dto: PauseOffTripProcessDto) {
    return this.tripProcessService.pauseOff(dto.activeTripUUID);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post('/save-picture')
  async savePicture(@Body() dto: SaveTripPictureDto) {
    return this.tripProcessService.saveTripPhoto(dto.tripId, dto.photo);
  }
}
