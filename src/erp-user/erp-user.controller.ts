import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ErpUserService } from './erp-user.service';
import { UpdateErpUserDto } from './dto/update-erp-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ErpUserResponse } from './responses';

@ApiTags('ErpUser (Пользователь ERP системы)')
@ApiBearerAuth()
@Controller('erp-user')
export class ErpUserController {
  constructor(private readonly erpUserService: ErpUserService) {}

  @Get()
  async findAll() {
    const users = await this.erpUserService.findAll();
    return users;
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.erpUserService.findById(+id);
    return new ErpUserResponse(user);
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateErpUserDto: UpdateErpUserDto,
  ) {
    const user = await this.erpUserService.update(+id, updateErpUserDto);
    return new ErpUserResponse(user);
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const user = await this.erpUserService.remove(+id);
    return new ErpUserResponse(user);
  }
}
