import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfirmAuthMobile, LoginDto, RegisterDto, TestDto } from './dto';
import { ErpUserService } from 'src/erp-user/erp-user.service';
import { Tokens } from './interfaces';
import { compareSync } from 'bcrypt';
import { ErpUser, TokenErp, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { DbService } from 'src/db/db.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { FranchiseService } from 'src/franchise/franchise.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { TwilioService } from 'nestjs-twilio';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserService } from 'src/user/user.service';
import { MobileAuthDto } from './dto/auth-mobile.dto';
import smsc_api from 'vendors/smsc_api';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IFingerprint } from 'nestjs-fingerprint';
import { ClientFingerPrint } from './types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly erpUserService: ErpUserService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly dbService: DbService,
    private readonly franchiseService: FranchiseService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly twilioService: TwilioService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    // if (user && user.role === 'FRANCHISE') {
    //   const franchise = await this.franchiseService.createFirstTime(user);
    //   if (franchise) {
    //     await this.erpUserService.update(user.id, {
    //       franchiseId: franchise.id,
    //     });
    //   }
    // }
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

  async forgotPassword(email: string) {
    console.log(email);
    const user = await this.erpUserService.findByEmail(email);
    if (!user) {
      throw new ForbiddenException('Такого пользователя не существует');
    }
    const resetToken = await this.erpUserService.generateResetToken(user);
    const link =
      this.configService.get('FRONTEND_URL') + `/reset-password/${resetToken}`;
    await this.mailService.sendResetPassword(user, link);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const forgotPassData = await this.dbService.forgotPasswordModel.findFirst({
      where: { token: dto.token },
    });

    if (!forgotPassData) {
      throw new ForbiddenException('Предоставленного токена не существует');
    }

    const user = await this.erpUserService.findById(forgotPassData.userId);

    if (!user) {
      throw new ForbiddenException('Данного пользователя больше не существует');
    }

    if (forgotPassData.expiredTime < new Date()) {
      throw new ForbiddenException(
        'Срок действия токена истек, повторите попытку',
      );
    }

    const hashedPassword = this.erpUserService.hashPassword(dto.password);

    const isPasswordReset = await this.dbService.erpUser.update({
      where: { id: forgotPassData.userId },
      data: {
        password: hashedPassword,
      },
    });

    if (!isPasswordReset) {
      throw new ForbiddenException(
        'Не удалось восстановить пароль, попробуйте еще раз либо повторите позже',
      );
    }

    await this.dbService.forgotPasswordModel.delete({
      where: { id: forgotPassData.id },
    });

    return {
      message: 'Пароль успешно изменен',
    };
  }

  async authMobile(dto: MobileAuthDto, fp: IFingerprint) {
    const code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    const TTL_MILISECONDS = 50000;

    const reqSession: ClientFingerPrint = await this.cacheManager.get(fp.id);

    if (reqSession && reqSession.requestCount === 3) {
      throw new ForbiddenException('Превышено максимальное число запросов');
    }

    this.sendSmsCode(dto.phone, code);

    if (!reqSession) {
      await this.cacheManager.set(
        fp.id,
        {
          phone: dto.phone,
          verificationCode: code,
          requestCount: 1,
        },
        TTL_MILISECONDS,
      );
    }

    if (reqSession && reqSession.requestCount < 3) {
      await this.cacheManager.set(
        fp.id,
        {
          phone: dto.phone,
          verificationCode: code,
          requestCount: reqSession.requestCount + 1,
        },
        TTL_MILISECONDS,
      );
    }

    return { message: `Код подтвердения отправлен на номер - ${dto.phone}` };
  }

  async confirmMobileAuth(dto: ConfirmAuthMobile, fp: IFingerprint) {
    const reqSession: ClientFingerPrint = await this.cacheManager.get(fp.id);

    if (!reqSession) {
      throw new ForbiddenException(
        'Не удалось. Сессия истекла. Повторите попытку',
      );
    }

    if (reqSession.verificationCode !== dto.code) {
      throw new ForbiddenException('Неверный код. Повторите попытку');
    }

    const user = await this.userService.create(reqSession.phone);

    if (!user) {
      throw new UnauthorizedException(
        'Ошибка при авторизации. Пользователя не существует',
      );
    }

    return this.generateMobileToken(user);
  }

  async authorizeMobileTestCase(dto: TestDto) {
    const user = await this.userService.create(dto.phone);

    if (!user) {
      throw new UnauthorizedException(
        'Ошибка при авторизации. Пользователя не существует',
      );
    }

    return this.generateMobileToken(user);
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
        name: user.name,
        uuid: user.uuid,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
        platform: user.platform,
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

  private async generateMobileToken(user: User): Promise<string> {
    const accessToken =
      'Bearer ' +
      this.jwtService.sign(
        {
          id: user.id,
          clientId: user.clientId,
          name: user.name,
          phone: user.phone,
          email: user.email,
          balance: user.balance,
          bonuses: user.bonuses,
          status: user.status,
          activePaymentMethod: user.activePaymentMethod,
          platform: user.platform,
        },
        { expiresIn: this.configService.get('JWT_EXP_MOBILE') },
      );
    return accessToken;
  }

  private sendSmsCode(phone: string, code: number) {
    smsc_api.configure({
      login: 'strangemisterio',
      password: 'wcCuT38!VfyF6LT',
    });

    const res = smsc_api.send_sms(
      {
        phones: [phone],
        message: `Ваш код подтверждения - ${code}`,
      },
      function (data, raw, err, code) {
        if (err) return console.log(err, 'code: ' + code);
        // console.log(data); // object
        // console.log(raw); // string in JSON format
      },
    );
  }
}
