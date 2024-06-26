import {
  Body,
  Controller,
  Post,
  Get,
  BadRequestException,
  UnauthorizedException,
  Res,
  HttpStatus,
  Param,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ConfirmAuthMobile, LoginDto, RegisterDto, TestDto } from './dto';
import { Tokens } from './interfaces';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Cookie, CurrentUser, Public, UserAgent } from '@common/decorators';
import { ErpUser } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MobileAuthDto } from './dto/auth-mobile.dto';
import { Fingerprint, IFingerprint } from 'nestjs-fingerprint';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const REFRESH_TOKEN = 'refreshtoken';

@ApiTags('Auth (Регистрация, вход, refresh token)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user: ErpUser = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(
        `Не удалось зарегистрировать пользователя с данными ${JSON.stringify(
          dto,
        )}`,
      );
    }
    return user;
  }

  @Public()
  @Post('mobile/auth')
  async authMobile(
    @Body() dto: MobileAuthDto,
    @Fingerprint() fp: IFingerprint,
  ) {
    const token = await this.authService.authMobile(dto, fp);
    // if (!token) {
    //   throw new BadRequestException(
    //     `Не удалось войти с данными ${JSON.stringify(dto)}}`,
    //   );
    // }
    return token;
  }

  @Public()
  @Post('mobile/confirm')
  async confirmMobileAuth(
    @Body() dto: ConfirmAuthMobile,
    @Fingerprint() fp: IFingerprint,
  ) {
    return this.authService.confirmMobileAuth(dto, fp);
  }

  @Public()
  @Post('mobile/test')
  async authorizeMobileTest(@Body() dto: TestDto) {
    return this.authService.authorizeMobileTestCase(dto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    const tokens = await this.authService.login(dto, agent);
    if (!tokens) {
      throw new BadRequestException(
        `Не удалось войти с данными ${JSON.stringify(dto)}}`,
      );
    }
    this.setRefreshTokenToCookies(tokens, res);
  }

  @Public()
  @Get('logout')
  async logout(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
  ) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }
    await this.authService.logout(refreshToken);
    res.cookie(REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });
    res.sendStatus(HttpStatus.OK);
  }

  @Public()
  @Get('refresh-tokens')
  async refresh(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);

    if (!tokens) {
      throw new UnauthorizedException();
    }

    this.setRefreshTokenToCookies(tokens, res);
  }

  @Public()
  @Get('forgot-password/:email')
  async resetPassword(@Param('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: `Письмо успешно отправлено на почту ${email}` };
  }

  @Public()
  @Post('reset-password')
  async resetPasswordFinally(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ token: tokens.accessToken });
  }
}
