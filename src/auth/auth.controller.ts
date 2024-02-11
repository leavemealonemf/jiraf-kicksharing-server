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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto';
import { Tokens } from './interfaces';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Cookie, Public, UserAgent } from '@common/decorators';
import { ErpUser } from '@prisma/client';
import { FranchiseService } from 'src/franchise/franchise.service';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

const REFRESH_TOKEN = 'refreshtoken';

@ApiTags('Auth (Регистрация, вход, refresh token)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly franchiseService: FranchiseService,
    private readonly mailService: MailService,
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
