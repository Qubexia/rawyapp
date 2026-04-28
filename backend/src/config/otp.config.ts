import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpConfigService {
  constructor(private configService: ConfigService) {}

  get expirySeconds(): number {
    return this.configService.get<number>('OTP_EXPIRY_SECONDS') || 600;
  }

  get maxAttempts(): number {
    return this.configService.get<number>('OTP_MAX_ATTEMPTS') || 5;
  }

  get cooldownSeconds(): number {
    return this.configService.get<number>('OTP_COOLDOWN_SECONDS') || 60;
  }

  get otpLength(): number {
    return 6;
  }
}