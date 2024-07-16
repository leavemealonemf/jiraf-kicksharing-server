import { Public } from '@common/decorators';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as DeviceDetector from 'device-detector-js';

@ApiBearerAuth()
@ApiTags('Перенаправление на скачивание приложения')
@Controller('/store')
export class ClientRedirectController {
  @Public()
  @Get()
  async redirectToMobileStore(@Res() res: Response, @Req() req: Request) {
    const deviceDetector = new DeviceDetector({
      skipBotDetection: true,
    });

    const device = deviceDetector.parse(req.headers['user-agent']);
    console.log(device);

    res.status(301).redirect('https://giraffe-go.ru/');
  }
}
