import { Controller, Post, Get, Body, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';

@ApiTags('auth')
@ApiCommonErrorResponses()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully registered', type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User with this email already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful', type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Req() req: Request): Promise<TokenResponseDto> {
    const user = req.user as any;
    return this.authService.login({ email: user.email, password: '' });
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token refreshed successfully', type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or expired refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user (invalidate refresh token)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout successful' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async logout(@Req() req: Request): Promise<{ message: string }> {
    const user = req.user as any;
    await this.authService.logout(user.sub);
    return { message: 'Logout successful' };
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: HttpStatus.FOUND, description: 'Redirect to Google OAuth page' })
  async googleAuth() {
    // This endpoint is handled by passport-google-oauth20
    // It redirects to Google's OAuth consent page
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: HttpStatus.OK, description: 'OAuth successful', type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'OAuth failed' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const { accessToken, refreshToken } = await this.authService.generateTokens(user);

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
  @ApiResponse({ status: HttpStatus.FOUND, description: 'Redirect to Facebook OAuth page' })
  async facebookAuth() {
    // This endpoint is handled by passport-facebook
    // It redirects to Facebook's OAuth consent page
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @ApiResponse({ status: HttpStatus.OK, description: 'OAuth successful', type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'OAuth failed' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const { accessToken, refreshToken } = await this.authService.generateTokens(user);

    // Redirect to frontend with tokens
    return res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }
}
