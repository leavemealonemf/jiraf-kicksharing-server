import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Promocodes (Промокоды)')
@ApiBearerAuth()
@Controller('promocode')
export class PromocodeController {
  constructor(private readonly promocodeService: PromocodeService) {}

  @Post()
  create(@Body() createPromocodeDto: CreatePromocodeDto) {
    return this.promocodeService.create(createPromocodeDto);
  }

  @Get()
  findAll() {
    return this.promocodeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promocodeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePromocodeDto: UpdatePromocodeDto,
  ) {
    return this.promocodeService.update(+id, updatePromocodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promocodeService.remove(+id);
  }
}