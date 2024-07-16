import { Public } from '@common/decorators';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as DeviceDetector from 'device-detector-js';

type OS = 'android' | 'ios';

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

    const os: OS = deviceDetector
      .parse(req.headers['user-agent'])
      .os.name.toLowerCase();

    if (os === 'android') {
      res.status(301).redirect('https://giraffe-go.ru/');
      return;
    }

    if (os === 'ios') {
      res
        .status(301)
        .redirect(
          'https://apps.apple.com/app/%D0%B6%D0%B8%D1%80%D0%B0%D1%84-go/id6503244292',
        );
      return;
    }

    res.status(301).redirect('https://giraffe-go.ru/');
  }
}
