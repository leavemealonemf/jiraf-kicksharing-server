import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { ErpUserService } from 'src/erp-user/erp-user.service';
import { Tokens } from './interfaces';
import { compareSync } from 'bcrypt';
import { ErpUser, TokenErp } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { DbService } from 'src/db/db.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { FranchiseService } from 'src/franchise/franchise.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly erpUserService: ErpUserService,
    private readonly jwtService: JwtService,
    private readonly dbService: DbService,
    private readonly franchiseService: FranchiseService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const findedUser = await this.erpUserService.findByEmail(dto.email);

    if (findedUser) {
      throw new ConflictException(
        'Пользователь с таким email уже зарегистрирован',
      );
    }

    const user: ErpUser = await this.erpUserService.create(dto).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (user && user.role === 'FRANCHISE') {
      const franchise = await this.franchiseService.createFirstTime(user);
      if (franchise) {
        await this.erpUserService.update(user.id, {
          franchiseId: franchise.id,
        });
      }
    }
    return user;
  }

  async login(dto: LoginDto, agent: string): Promise<Tokens> {
    const user: ErpUser = await this.erpUserService
      .findByEmail(dto.email)
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
    if (!user || !compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Не верный логин или пароль');
    }
    return this.generateTokens(user, agent);
  }

  async logout(token: string) {
    return this.dbService.tokenErp.delete({ where: { token } }).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async resetPassword(email: string) {
    const user = await this.erpUserService.findByEmail(email);
    if (!user) {
      throw new ForbiddenException('Такого пользователя не существует');
    }
    const resetToken = this.erpUserService.generateResetToken();
    const link =
      this.configService.get('FRONTEND_URL') + `/?token=${resetToken}`;
    await this.mailService.sendResetPassword(user, link);
  }

  async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
    const token = await this.dbService.tokenErp.findUnique({
      where: { token: refreshToken },
    });
    if (!token) {
      throw new UnauthorizedException();
    }

    await this.dbService.tokenErp.delete({ where: { token: refreshToken } });

    if (new Date(token.exp) < new Date()) {
      throw new UnauthorizedException();
    }

    const user = await this.erpUserService.findById(token.erpUserId);
    return this.generateTokens(user, agent);
  }

  private async generateTokens(user: ErpUser, agent: string): Promise<Tokens> {
    const accessToken =
      'Bearer ' +
      this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    const refreshToken = await this.getRefreshToken(user.id, agent);
    return { accessToken, refreshToken };
  }

  private async getRefreshToken(
    userId: number,
    agent: string,
  ): Promise<TokenErp> {
    const _token = await this.dbService.tokenErp.findFirst({
      where: { erpUserId: userId, userAgent: agent },
    });

    const token = _token?.token ?? '';

    return this.dbService.tokenErp.upsert({
      where: { token },
      update: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
      },
      create: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        erpUserId: userId,
        userAgent: agent,
      },
    });
  }
}
