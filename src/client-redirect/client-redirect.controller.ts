import { Public } from '@common/decorators';
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiBearerAuth()
@ApiTags('Перенаправление на скачивание приложения')
@Controller('/store')
export class ClientRedirectController {
  @Public()
  @Get()
  async redirectToMobileStore(@Res() res: Response, @Req() req: Request) {
    console.log(req.headers['user-agent']);
    res.status(301).redirect('https://giraffe-go.ru/');
  }
}
