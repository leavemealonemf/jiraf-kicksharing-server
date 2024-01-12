import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { ErpUserService } from './erp-user.service';
import { UpdateErpUserDto } from './dto/update-erp-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ErpUser (Пользователь ERP системы)')
@Controller('erp-user')
export class ErpUserController {
  constructor(private readonly erpUserService: ErpUserService) {}

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
