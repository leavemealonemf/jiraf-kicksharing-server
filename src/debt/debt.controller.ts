import { Body, Controller, Get, Post } from '@nestjs/common';
import { DebtService } from './debt.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateDebtDto } from './dto';

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
}
