import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
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
} from './dto';

@UseGuards(PlatformsGuard)
@Platforms('MOBILE')
@ApiTags('Процесс поездки')
@ApiBearerAuth()
@Controller('trip-process')
export class TripProcessController {
  constructor(private readonly tripProcessService: TripProcessService) {}

  @Post('/start')
  async start(@Body() dto: StartTripProcessDto, @CurrentUser() user: any) {
    return this.tripProcessService.start(dto, user);
  }

  @Post('/end')
  async end(@Body() dto: EndTripProcessDto) {
    return this.tripProcessService.end(dto);
  }

  @Get('/active-trips')
  async getActiveTrips(@CurrentUser() user: any) {
    return this.tripProcessService.getActiveTrips(user.id);
  }

  @Post('/test/geofencing')
  async testGeofencingDevice(@Body() coords: { lat: number; lon: number }) {
    return this.tripProcessService.getGeofencingTripStatus(
      coords.lat,
      coords.lon,
    );
  }

  @Get('/get-upd-trip-info/:tripUUID')
  async getUpdatedTripInfo(
    @Param('tripUUID') tripUUID: string,
    @CurrentUser() user: any,
  ) {
    return this.tripProcessService.getUpdatedTripInfo(tripUUID);
  }

  @Post('/pause-on')
  async pauseOn(@Body() dto: PauseOnTripProcessDto) {
    return this.tripProcessService.pauseOn(dto.activeTripUUID);
  }

  @Post('/pause-off')
  async pauseOff(@Body() dto: PauseOffTripProcessDto) {
    return this.tripProcessService.pauseOff(dto.activeTripUUID);
  }

  @Post('/save-picture')
  async savePicture(@Body() dto: SaveTripPictureDto) {
    return this.tripProcessService.saveTripPhoto(dto.tripId, dto.photo);
  }
}
