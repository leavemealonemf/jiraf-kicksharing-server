import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Platforms } from '@common/decorators';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';

@UseGuards(PlatformsGuard)
@Platforms('MOBILE')
@ApiTags('Trips (Поездки)')
@ApiBearerAuth()
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @Get()
  findAll(
    @Query('interval') interval: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.tripService.findAll(interval, start, end);
  }

  @Get('user-trips')
  getUserTrips(@CurrentUser() user: any, @Query('page') page: number) {
    return this.tripService.getUserTrips(user.id, page);
  }

  @Get('user-trips/:id')
  getOneTripMobile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tripService.getOneTripMobile(+id, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(+id, updateTripDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripService.remove(+id);
  }
}
