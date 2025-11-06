import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { IEmail, IVerifyEmail, IResetPassword, VerifyEmailTemplate, ResetPasswordTemplate } from './templates';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailer: NestMailerService,
    private readonly config: ConfigService,
  ) {}

  private async send(data: IEmail) {
    const from = this.config.get<string>('EMAIL_FROM') || 'Hustl <no-reply@hustl.app>';

    console.log(from);

    const res = await this.mailer.sendMail({
      from,
      to: data.email,
      html: data.html,
      text: data.text,
      subject: data.subject,
    });

    console.log(res);

    return res;
  }

  async verifyEmail(data: IVerifyEmail) {
    const { subject, text, html } = VerifyEmailTemplate(data);
    await this.send({ subject, text, html, email: data.email });
  }

  async resetPassword(data: IResetPassword) {
    const { subject, text, html } = ResetPasswordTemplate(data);
    await this.send({ subject, text, html, email: data.email });
  }
}
