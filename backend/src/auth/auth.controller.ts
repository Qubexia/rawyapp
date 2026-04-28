import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterCreatorDto } from './dto/register-creator.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import {
  getImageMulterConfig,
  getRelativeUrl,
} from '../common/utils/file-upload.util';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('auth')
@ApiCommonErrorResponses()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('register-creator')
  @UseInterceptors(
    FileInterceptor('avatar', getImageMulterConfig(5 * 1024 * 1024)),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Register a new creator with show and avatar' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Creator successfully registered',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'SecurePass123!' },
        showName: { type: 'string', example: 'My Awesome Podcast' },
        avatar: { type: 'string', format: 'binary' },
      },
      required: ['name', 'email', 'password', 'showName'],
    },
  })
  async registerCreator(
    @Body() registerCreatorDto: RegisterCreatorDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<TokenResponseDto> {
    throw new BadRequestException(
      'Creator direct registration is disabled. Please register as a user, then claim your podcast.',
    );
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password using current password or OTP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Current password or OTP is incorrect',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<TokenResponseDto> {
    return this.authService.changePassword(userId, dto);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password-reset OTP via email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'If the email exists an OTP has been sent',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto);
    return {
      message:
        'If an account with that email exists, a reset code has been sent',
    };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using email + OTP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired reset code',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<TokenResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user (invalidate refresh token)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async logout(@Req() req: Request): Promise<{ message: string }> {
    const user = req.user as UserDocument;
    await this.authService.logout(user._id.toString());
    return { message: 'Logout successful' };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirect to Google OAuth page',
  })
  async googleAuth() {
    // This endpoint is handled by passport-google-oauth20
    // It redirects to Google's OAuth consent page
  }

  @Public()
  @Post('google/mobile')
  @ApiOperation({ summary: 'Login with Google ID Token from mobile client' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid Google token or authentication failed',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Missing idToken',
  })
  async googleAuthMobile(
    @Body('idToken') idToken: string,
  ): Promise<TokenResponseDto> {
    if (!idToken || idToken.trim() === '') {
      throw new BadRequestException('Google idToken is required');
    }
    return this.authService.validateGoogleIdToken(idToken);
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OAuth successful',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'OAuth failed' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserDocument;
    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    // Redirect to frontend with tokens
    // In production, you might want to use a more secure method like short-lived tokens
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }

  @Public()
  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirect to Facebook OAuth page',
  })
  async facebookAuth() {
    // This endpoint is handled by passport-facebook
    // It redirects to Facebook's OAuth consent page
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OAuth successful',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'OAuth failed' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserDocument;
    const { accessToken, refreshToken } =
      await this.authService.generateTokens(user);

    // Redirect to frontend with tokens
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }
}
