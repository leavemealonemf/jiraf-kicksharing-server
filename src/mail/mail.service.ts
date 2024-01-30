import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ErpUser } from '@prisma/client';
import { RegisterDto } from 'src/auth/dto';

@Injectable()
export class MailService {
  private logger = new Logger();

  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: RegisterDto) {
    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'awesome.vanon@yandex.ru',
        subject: 'Приглашение в ERP систему',
        template: './confirmation',
        context: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async sendResetPassword(user: ErpUser, link: string) {
    await this.mailerService
      .sendMail({
        to: user.email,
        from: 'awesome.vanon@yandex.ru',
        subject: 'Восстановление пароля',
        template: './reset-password',
        context: {
          link: link,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }
}
