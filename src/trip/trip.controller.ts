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
import { ErpUser } from '@prisma/client';

@ApiTags('Trips (Поездки)')
@ApiBearerAuth()
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Get()
  async findAll(
    @CurrentUser() erpUser: ErpUser,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('who') franchiseId = 0,
  ) {
    return await this.tripService.findAll(erpUser, start, end, +franchiseId);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Get('user-trips')
  getUserTrips(@CurrentUser() user: any, @Query('page') page: number) {
    return this.tripService.getUserTrips(user.id, page);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
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
