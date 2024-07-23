import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Platforms } from '@common/decorators';
import { ErpUser } from '@prisma/client';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';

@ApiTags('Stats (Статистика)')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(PlatformsGuard)
  @Platforms('WEB')
  @Get('/report')
  async report(
    @CurrentUser() erpUser: ErpUser,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('who') franchiseId = 0,
  ) {
    return await this.statsService.report(erpUser, start, end, +franchiseId);
  }
}
