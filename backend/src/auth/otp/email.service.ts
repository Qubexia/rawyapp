import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OtpPurpose } from './entities/otp.entity';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string, purpose: OtpPurpose) {
    const subject = this.getSubject(purpose);
    const html = this.getOtpTemplate(otp, purpose);

    try {
      await this.transporter.sendMail({
        from:
          this.configService.get('SMTP_FROM') ||
          '"Rawy App" <no-reply@rawyapp.com>',
        to: email,
        subject,
        html,
      });
      this.logger.log(`OTP email sent to ${email} for purpose: ${purpose}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error.stack);
      throw error;
    }
  }

  private getSubject(purpose: OtpPurpose): string {
    switch (purpose) {
      case OtpPurpose.VERIFY_EMAIL:
        return 'Verify your email - Rawy App';
      case OtpPurpose.PASSWORD_RESET:
        return 'Reset your password - Rawy App';
      case OtpPurpose.PASSWORD_CHANGE:
        return 'Change your password - Rawy App';
      default:
        return 'Security Code - Rawy App';
    }
  }

  private getOtpTemplate(otp: string, purpose: OtpPurpose): string {
    const purposeText = purpose.replace('_', ' ');
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4a90e2; text-align: center;">Rawy App</h2>
        <div style="padding: 20px; text-align: center; color: #333;">
          <p>Your security code for <strong>${purposeText}</strong> is:</p>
          <div style="background: #f9f9f9; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 30px 0; border: 1px dashed #4a90e2; color: #4a90e2;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Rawy App. All rights reserved.</p>
      </div>
    `;
  }

  async sendVerificationConfirmation(email: string) {
    const subject = 'Email Verified - Rawy App';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #27ae60; text-align: center;">Email Verified!</h2>
        <div style="padding: 20px; text-align: center; color: #333;">
          <p>Congratulations! Your email has been successfully verified.</p>
          <p>You can now enjoy all the features of Rawy App.</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Rawy App. All rights reserved.</p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from:
          this.configService.get('SMTP_FROM') ||
          '"Rawy App" <no-reply@rawyapp.com>',
        to: email,
        subject,
        html,
      });
      this.logger.log(`Verification confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification confirmation to ${email}`,
        error.stack,
      );
    }
  }
}
