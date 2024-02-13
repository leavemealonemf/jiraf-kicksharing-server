import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: 'smtp.mail.ru',
          port: 465,
          secure: true,
          auth: {
            // user: config.get('SMTP_USER'),
            user: 'smasters.zakaz@mail.ru',
            // pass: config.get('SMTP_PASSWORD'),
            pass: 'vy1YNAKuhTkVX5v6EhYn',
          },
        },
        template: {
          dir: join(__dirname, '../dist/mail/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
