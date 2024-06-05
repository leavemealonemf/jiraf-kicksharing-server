import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ScooterService } from './scooter.service';
import { CreateScooterDto } from './dto/create-scooter.dto';
import { UpdateScooterDto } from './dto/update-scooter.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { CurrentUser, Platforms } from '@common/decorators';
import { ErpUser } from '@prisma/client';

@ApiTags('Scooter (Самокат)')
@ApiBearerAuth()
@Controller('scooter')
export class ScooterController {
  constructor(private readonly scooterService: ScooterService) {}

  @Post()
  async create(@Body() createScooterDto: CreateScooterDto) {
    return this.scooterService.create(createScooterDto);
  }

  @Get()
  async findAll() {
    return this.scooterService.findAll();
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Get('/erp')
  async findAllErp(@CurrentUser() user: ErpUser) {
    return await this.scooterService.findAllErp(user);
  }

  @Get('/mobile')
  async findAllMobile() {
    return this.scooterService.findAllMobile();
  }

  @Get('/mobile/test')
  async findAllMobileTest() {
    return this.scooterService.findAllMobileTest();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.scooterService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScooterDto: UpdateScooterDto,
  ) {
    return this.scooterService.update(+id, updateScooterDto);
  }

  @Delete(':scooterId/:rightechScooterId')
  async remove(
    @Param('scooterId') id: string,
    @Param('rightechScooterId') rightechScooterId: string,
  ) {
    return this.scooterService.remove(+id, rightechScooterId);
  }
}
