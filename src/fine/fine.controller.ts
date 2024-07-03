import { Body, Controller, Get, Post } from '@nestjs/common';
import { FineService } from './fine.service';
import { CreateFineDto } from './dto';
import { CurrentUser } from '@common/decorators';
import { ErpUser } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// @UseGuards(PlatformsGuard)
// @Platforms('WEB')
@ApiTags('Штрафы')
@ApiBearerAuth()
@Controller('fine')
export class FineController {
  constructor(private readonly fineService: FineService) {}

  @Get()
  async getAll() {
    return await this.fineService.getAll();
  }

  @Post()
  async create(@Body() dto: CreateFineDto, @CurrentUser() erpUser: ErpUser) {
    return await this.fineService.create(dto, erpUser);
  }
}
