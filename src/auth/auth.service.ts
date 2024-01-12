import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { ErpUserService } from 'src/erp-user/erp-user.service';
import { Tokens } from './interfaces';
import { compareSync } from 'bcrypt';
import { ErpUser, TokenErp } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { DbService } from 'src/db/db.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly erpUserService: ErpUserService,
    private readonly jwtService: JwtService,
    private readonly dbService: DbService,
  ) {}

  async register(dto: RegisterDto) {
    return this.erpUserService.create(dto).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const user: ErpUser = await this.erpUserService
      .findByEmail(dto.email)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
    if (!user || compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Не верный логин или пароль');
    }
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });
    const refreshToken = await this.getRefreshToken(user.id);
    return { accessToken, refreshToken };
  }

  private async getRefreshToken(userId: number): Promise<TokenErp> {
    return this.dbService.tokenErp.create({
      data: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId,
      },
    });
  }
}
