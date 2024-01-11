import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ErpUserService } from './erp-user.service';
import { CreateErpUserDto } from './dto/create-erp-user.dto';
import { UpdateErpUserDto } from './dto/update-erp-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ErpUser (Пользователь ERP системы)')
@Controller('erp-user')
export class ErpUserController {
  constructor(private readonly erpUserService: ErpUserService) {}

  @Post()
  create(@Body() createErpUserDto: CreateErpUserDto) {
    return this.erpUserService.create(createErpUserDto);
  }

  @Get()
  findAll() {
    return this.erpUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.erpUserService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateErpUserDto: UpdateErpUserDto) {
    return this.erpUserService.update(+id, updateErpUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.erpUserService.remove(+id);
  }
}
