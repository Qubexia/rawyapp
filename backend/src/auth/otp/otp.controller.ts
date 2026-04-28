import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { OtpPurpose } from './entities/otp.entity';
import { UsersService } from '../../users/users.service';

@ApiTags('auth/otp')
@Controller('auth/otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const { email, purpose } = sendOtpDto;

    // For verification, ensure user exists
    if (purpose === OtpPurpose.VERIFY_EMAIL) {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new BadRequestException('User with this email does not exist');
      }
      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }
    }

    await this.otpService.generateOtp(email, purpose);
    return {
      message: 'OTP sent successfully to ' + email,
    };
  }

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    const { email, purpose } = resendOtpDto;
    await this.otpService.generateOtp(email, purpose);
    return {
      message: 'OTP sent successfully to ' + email,
    };
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel current OTP' })
  @ApiResponse({ status: 200, description: 'OTP cancelled successfully' })
  async cancelOtp(@Body() resendOtpDto: ResendOtpDto) {
    const { email, purpose } = resendOtpDto;
    await this.otpService.cancelOtp(email, purpose);
    return {
      message: 'OTP cancelled successfully',
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'OTP not found' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { email, otp, purpose } = verifyOtpDto;
    await this.otpService.verifyOtp(email, otp, purpose);

    // If purpose is email verification, update user and send confirmation
    if (purpose === OtpPurpose.VERIFY_EMAIL) {
      await this.usersService.verifyEmail(email);
      // T040: Send confirmation email
      await this.otpService.sendConfirmationEmail(email);
    }

    return {
      message: 'OTP verified successfully',
    };
  }
}
