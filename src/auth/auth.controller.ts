import { Body, Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto';

@ApiTags('Auth (Регистрация, вход, refresh token)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {}

  @Post('login')
  login(@Body() dto: LoginDto) {}

  @Get('refresh')
  refresh(@Body() dto) {}
}
