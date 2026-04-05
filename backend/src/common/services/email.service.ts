import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.configService.get('SMTP_PORT') ?? 587),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'SMTP not configured — OTP codes will be logged to console (dev mode)',
      );
    }
  }

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const from =
      this.configService.get<string>('SMTP_FROM') ?? 'Rawy <no-reply@rawy.app>';

    const subject = 'Your Rawy password reset code';
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#6750A4;">Reset your password</h2>
        <p>Use the code below to reset your Rawy account password. It expires in <strong>15 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#6750A4;margin:24px 0;">${otp}</div>
        <p style="color:#888;font-size:13px;">If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({ from, to, subject, html });
    } else {
      // Dev fallback — log to console
      this.logger.log(`[DEV] Password reset OTP for ${to}: ${otp}`);
    }
  }
}
