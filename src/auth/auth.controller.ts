import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto) {}

  @Post('login')
  login(@Body() dto) {}

  @Get('refresh')
  refresh(@Body() dto) {}
}
