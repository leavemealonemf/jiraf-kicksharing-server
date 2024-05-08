import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { UserPaymentsService } from './user-payments.service';
import { PlatformsGuard } from 'src/auth/guards/platform.guard';
import { CurrentUser, Platforms } from '@common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Платежи пользователя')
@ApiBearerAuth()
@Controller('user-payments')
export class UserPaymentsController {
  constructor(private readonly userPaymentsService: UserPaymentsService) {}

  @UseGuards(PlatformsGuard)
  @Platforms('MOBILE')
  @Get()
  async getUserPayments(@CurrentUser() user: any, @Query('page') page: number) {
    console.log(user);
    return this.userPaymentsService.getUserPayments(user.id, page);
  }
}
