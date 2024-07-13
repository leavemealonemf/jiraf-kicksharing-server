import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { DebtService } from './debt.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateDebtDto } from './dto';
import { CurrentUser, Platforms } from '@common/decorators';
import { ErpUser, User } from '@prisma/client';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';

@ApiTags('Задолженности')
@ApiBearerAuth()
@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Get()
  async getAll() {
    return await this.debtService.getAll();
  }

  @Post()
  async create(@Body() dto: CreateDebtDto) {
    return await this.debtService.create(dto);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Patch(':uuid')
  async payOfDebt(@Param('uuid') debtUUID: string, @CurrentUser() user: User) {
    return await this.debtService.payOfDebt(user.id, debtUUID);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Delete(':uuid')
  async deleteDebt(
    @Param('uuid') debtUUID: string,
    @CurrentUser() user: ErpUser,
  ) {
    return await this.debtService.deleteDebt(debtUUID, user);
  }
}
