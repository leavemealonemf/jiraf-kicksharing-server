import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Stats (Статистика)')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStats(
    @Query('interval') interval: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.statsService.getStats(interval, start, end);
  }
}
