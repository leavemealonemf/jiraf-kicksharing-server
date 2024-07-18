import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Platforms } from '@common/decorators';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { User } from '@prisma/client';

@ApiTags('User (Пользователь мобилки)')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get('all')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Delete('delete')
  async remove(@CurrentUser() user: any) {
    return this.userService.remove(user.id);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Get()
  async getMe(@CurrentUser() user: any) {
    return this.userService.findOneByUUID(user.clientId);
  }

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Get('delete-account')
  async deleteAccount(@CurrentUser() user: User) {
    return await this.userService.deleteUserAccount(user.id);
  }
}
