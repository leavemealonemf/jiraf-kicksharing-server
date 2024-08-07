// import { JwtPayload } from '../interfaces';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ErpUser, User } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ErpUserService } from 'src/erp-user/erp-user.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly erpUserService: ErpUserService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  async validate(payload: any) {
    let user: ErpUser | User;

    if (payload.platform === 'WEB') {
      const webUser = await this.erpUserService
        .findById(payload.id)
        .catch((err) => {
          this.logger.error(err);
          return null;
        });
      user = webUser;
    } else {
      const mobileUser: User = await this.userService
        .findOneByUUID(payload.clientId)
        .catch((err) => {
          this.logger.error(err);
          return null;
        });

      if (mobileUser.status === 'DELETED') {
        throw new UnauthorizedException();
      }

      user = mobileUser;
    }

    console.log('USER FROM JWT STRATEGY', JSON.stringify(user));

    if (!user) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
