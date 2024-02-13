import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Post,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ErpUserService } from './erp-user.service';
import { UpdateErpUserDto } from './dto/update-erp-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ErpUserResponse } from './responses';
import { CurrentUser } from '@common/decorators';
import { ErpUser } from '@prisma/client';
import { JwtPayload } from 'src/auth/interfaces';

@ApiTags('ErpUser (Пользователь ERP системы)')
@ApiBearerAuth()
@Controller('erp-user')
export class ErpUserController {
  constructor(private readonly erpUserService: ErpUserService) {}

  @Get('all')
  async findAll() {
    const users = await this.erpUserService.findAll();
    return users;
  }

  @Post('create-base-user')
  async createBaseUser() {
    return this.erpUserService.createBaseUser();
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
  async remove(@Param('id') id: string, @CurrentUser() decUser: ErpUser) {
    const user = await this.erpUserService.remove(+id, decUser);
    return new ErpUserResponse(user);
  }

  @Get()
  async getMe(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
