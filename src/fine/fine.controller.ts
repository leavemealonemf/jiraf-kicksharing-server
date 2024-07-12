import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FineService } from './fine.service';
import { CreateFineDto } from './dto';
import { CurrentUser, Platforms } from '@common/decorators';
import { ErpUser, User } from '@prisma/client';
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

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Patch(':id')
  async makeFinePaid(@Param('id') id: string) {
    return await this.fineService.makeFinePaid(+id);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Patch('pay/:uuid')
  async payOfFine(@Param('uuid') fineUUID: string, @CurrentUser() user: User) {
    return await this.fineService.payOfFine(user.id, fineUUID);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() erpUser: ErpUser) {
    return await this.fineService.delete(+id, erpUser);
  }
}
