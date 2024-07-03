import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FineService } from './fine.service';
import { CreateFineDto } from './dto';
import { CurrentUser, Platforms } from '@common/decorators';
import { ErpUser } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';

@ApiTags('Штрафы')
@ApiBearerAuth()
@Controller('fine')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @Get()
  async getAll() {
    return await this.fineService.getAll();
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Post()
  async create(@Body() dto: CreateFineDto, @CurrentUser() erpUser: ErpUser) {
    return await this.fineService.create(dto, erpUser);
  }
}
