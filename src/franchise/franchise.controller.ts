import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Post,
} from '@nestjs/common';
import { FranchiseService } from './franchise.service';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { Platforms } from '@common/decorators';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { ConnectOwnerToFranchiseDto } from './dto';

@UseGuards(PlatformsGuard)
@Platforms('WEB')
@ApiTags('Франшиза')
@ApiBearerAuth()
@Controller('franchise')
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Post()
  async create(@Body() dto: CreateFranchiseDto) {
    return await this.franchiseService.create(dto);
  }

  @Get()
  async findAll() {
    return await this.franchiseService.findAll();
  }

  @Post('connect-owner')
  async connectOwnerToFranchise(dto: ConnectOwnerToFranchiseDto) {
    console.log(JSON.stringify(dto));
    return await this.franchiseService.connectOwnerToFranchise(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.franchiseService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFranchiseDto: UpdateFranchiseDto,
  ) {
    return await this.franchiseService.update(+id, updateFranchiseDto);
  }
}
