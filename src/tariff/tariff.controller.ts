import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TariffService } from './tariff.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateTariffOrdersDto, CreateTariffDto, UpdateTariffDto } from './dto';

@ApiTags('Tariff (Тариф)')
@ApiBearerAuth()
@Controller('tariff')
export class TariffController {
  constructor(private readonly tariffService: TariffService) {}

  @Post()
  async create(@Body() createTariffDto: CreateTariffDto) {
    return await this.tariffService.create(createTariffDto);
  }

  @Get()
  findAll() {
    return this.tariffService.findAll();
  }

  @Post('update-orders')
  async updateTariffsOrders(dto: UpdateTariffOrdersDto) {
    return await this.tariffService.updateTariffsOrders(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tariffService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTariffDto: UpdateTariffDto) {
    return this.tariffService.update(+id, updateTariffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tariffService.remove(+id);
  }
}
