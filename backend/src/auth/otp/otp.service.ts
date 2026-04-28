import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Otp, OtpDocument, OtpPurpose } from './entities/otp.entity';
import { EmailService } from './email.service';
import { OtpConfigService } from '../../config/otp.config';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private emailService: EmailService,
    private otpConfigService: OtpConfigService,
  ) {}

  /**
   * Generates a new 6-digit OTP, hashes it, and saves/updates it in the database.
   * Then sends it via email.
   */
  async generateOtp(email: string, purpose: OtpPurpose): Promise<string> {
    this.logger.log(`Generating OTP for ${email} with purpose: ${purpose}`);

    // Generate numeric OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();

    // Check if cooldown period is active
    const existingOtp = await this.otpModel.findOne({ email, purpose });
    if (existingOtp && existingOtp.lastAttemptAt) {
      const secondsSinceLast = Math.floor(
        (Date.now() - existingOtp.lastAttemptAt.getTime()) / 1000,
      );
      if (secondsSinceLast < this.otpConfigService.cooldownSeconds) {
        throw new BadRequestException(
          `Please wait ${this.otpConfigService.cooldownSeconds - secondsSinceLast} seconds before requesting a new OTP.`,
        );
      }
    }

    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(rawOtp, salt);

    // Save to DB
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + this.otpConfigService.expirySeconds,
    );

    await this.otpModel.findOneAndUpdate(
      { email, purpose },
      {
        email,
        otp: hashedOtp,
        purpose,
        expiresAt,
        attempts: 0,
        lastAttemptAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // Send via email
    await this.emailService.sendOtpEmail(email, rawOtp, purpose);

    return rawOtp;
  }

  /**
   * Verifies the provided OTP for a given email and purpose.
   */
  async verifyOtp(
    email: string,
    rawOtp: string,
    purpose: OtpPurpose,
  ): Promise<boolean> {
    this.logger.log(`Verifying OTP for ${email} with purpose: ${purpose}`);

    const otpRecord = await this.otpModel.findOne({ email, purpose });

    if (!otpRecord) {
      throw new NotFoundException('No OTP found for this email and purpose');
    }

    // Check expiration
    if (otpRecord.expiresAt < new Date()) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('OTP expired');
    }

    // Check max attempts
    if (otpRecord.attempts >= this.otpConfigService.maxAttempts) {
      await this.otpModel.deleteOne({ _id: otpRecord._id });
      throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
    }

    // Verify hash
    const isValid = await bcrypt.compare(rawOtp, otpRecord.otp);

    if (!isValid) {
      otpRecord.attempts += 1;
      otpRecord.lastAttemptAt = new Date();
      await otpRecord.save();
      throw new BadRequestException('Invalid OTP');
    }

    // Success - delete records
    await this.otpModel.deleteOne({ _id: otpRecord._id });
    this.logger.log(`OTP successfully verified for ${email} with purpose: ${purpose}`);
    return true;
  }

  /**
   * Deletes the OTP for a given email and purpose.
   */
  async cancelOtp(email: string, purpose: OtpPurpose): Promise<void> {
    await this.otpModel.deleteOne({ email, purpose });
    this.logger.log(`OTP cancelled for ${email} with purpose: ${purpose}`);
  }

  async sendConfirmationEmail(email: string): Promise<void> {
    await this.emailService.sendVerificationConfirmation(email);
  }
}
