import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';

@Module({
  exports: [MailerService],
  providers: [MailerService, ConfigService],
  imports: [
    NestMailerModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          secure: true,
          port: config.getOrThrow('EMAIL_PORT'),
          host: config.getOrThrow('EMAIL_HOST'),
          auth: { user: config.getOrThrow('EMAIL_USER'), pass: config.getOrThrow('EMAIL_PASSWORD') },
        },
        defaults: { from: config.get('EMAIL_FROM') || 'Hustl <no-reply@hustl.app>' },
      }),
    }),
  ],
})
export class MailerModule {}
