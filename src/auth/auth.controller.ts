import {
  Body,
  Controller,
  Post,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto';

@ApiTags('Auth (Регистрация, вход, refresh token)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(
        `Не удалось зарегистрировать пользователя с данными ${JSON.stringify(
          dto,
        )}`,
      );
    }
    const message = 'Пользователь зарегистрирован';
    return message;
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);
    if (!tokens) {
      throw new BadRequestException(
        `Не удалось войти с данными ${JSON.stringify(dto)}}`,
      );
    }
    const { accessToken } = tokens;
    return { token: accessToken };
  }

  @Get('refresh')
  refresh(@Body() dto) {}
}
