import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { CreatorsService } from '../creators/creators.service';
import { EmailService } from '../common/services/email.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterCreatorDto } from './dto/register-creator.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '../common/constants/roles.enum';
import { Types } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';

interface OAuthUser {
  provider: 'google' | 'facebook';
  providerId: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private creatorsService: CreatorsService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const { name, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.usersService.create({
      name,
      email,
      passwordHash,
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: user.toObject(),
    };
  }

  async registerCreator(
    registerCreatorDto: RegisterCreatorDto,
    avatarPath?: string,
  ): Promise<TokenResponseDto> {
    const { name, email, password, showName } = registerCreatorDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with CREATOR role
    const user = await this.usersService.create({
      name,
      email,
      passwordHash,
      role: Role.CREATOR,
    });

    // Create creator profile with showName and avatar if provided
    await this.creatorsService.becomeCreator(
      new Types.ObjectId(user._id),
      name,
      showName,
      avatarPath,
    );

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: user.toObject(),
    };
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user: user.toObject(),
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find user
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account has been deactivated');
      }

      // Verify stored refresh token matches
      if (!user.refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const storedTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!storedTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (
        user.refreshTokenExpiresAt &&
        new Date() > user.refreshTokenExpiresAt
      ) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: user.toObject(),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('User not found or password not set');
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { passwordHash: newPasswordHash });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const { email } = dto;
    const user = await this.usersService.findByEmailWithResetOtp(email);

    // Always return success to prevent email enumeration
    if (!user || !user.isActive) return;

    const otp = String(randomInt(100000, 1000000)); // 6-digit OTP
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.usersService.setPasswordResetOtp(
      user._id.toString(),
      otpHash,
      expiresAt,
    );
    await this.emailService.sendPasswordResetOtp(email, otp);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { email, otp, newPassword } = dto;
    const user = await this.usersService.findByEmailWithResetOtp(email);

    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    if (new Date() > user.passwordResetOtpExpires) {
      await this.usersService.clearPasswordResetOtp(user._id.toString());
      throw new BadRequestException('Reset code has expired');
    }

    const isOtpValid = await bcrypt.compare(otp, user.passwordResetOtp);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid reset code');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(
      user._id.toString(),
      newPasswordHash,
    );
    await this.usersService.clearPasswordResetOtp(user._id.toString());
  }

  async generateTokens(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // ConfigService always returns strings from .env; Number() converts to actual number
    // so jsonwebtoken treats it as seconds (not milliseconds like string "900" would be)
    const accessTtl = Number(this.configService.get('JWT_ACCESS_TTL') ?? 900);
    const refreshTtl = Number(
      this.configService.get('JWT_REFRESH_TTL') ?? 604800,
    );

    if (!accessTtl || !refreshTtl) {
      throw new Error('JWT TTL values are not configured properly');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessTtl,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshTtl,
    });

    // Hash refresh token and store in database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const refreshTokenExpiresAt = new Date(Date.now() + refreshTtl * 1000);

    await this.usersService.updateRefreshToken(
      user._id.toString(),
      refreshTokenHash,
      refreshTokenExpiresAt,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateOAuthUser(oauthUser: OAuthUser): Promise<UserDocument> {
    const { provider, providerId, email, name } = oauthUser;

    let user: UserDocument | null;

    // Try to find user by provider ID
    if (provider === 'google') {
      user = await this.usersService.findByGoogleId(providerId);
    } else {
      user = await this.usersService.findByFacebookId(providerId);
    }

    if (user) {
      // User exists, return it
      return user;
    }

    // Check if user exists with same email (account linking)
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      // Link OAuth account to existing user
      const updateData: any = {};
      if (provider === 'google') {
        updateData.googleId = providerId;
      } else {
        updateData.facebookId = providerId;
      }

      user = await this.usersService.update(
        existingUser._id.toString(),
        updateData,
      );
      if (user) {
        return user;
      }
    }

    // Create new user
    const createData: any = {
      name,
      email,
      passwordHash: '', // OAuth users don't have password
    };

    if (provider === 'google') {
      createData.googleId = providerId;
    } else {
      createData.facebookId = providerId;
    }

    user = await this.usersService.create(createData);
    return user;
  }

  async validateGoogleIdToken(idToken: string): Promise<TokenResponseDto> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new UnauthorizedException(
        'Google authentication is not configured on this server',
      );
    }

    // Collect all valid client IDs (web, android, iOS) so tokens from
    // any platform are accepted. The audience in a Google ID token
    // matches the client ID of the OAuth client that created it.
    const validAudiences = [clientId];
    const androidClientId = this.configService.get<string>('GOOGLE_ANDROID_CLIENT_ID');
    const iosClientId = this.configService.get<string>('GOOGLE_IOS_CLIENT_ID');
    if (androidClientId) validAudiences.push(androidClientId);
    if (iosClientId) validAudiences.push(iosClientId);

    const client = new OAuth2Client(clientId);

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: validAudiences,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        console.warn('[Google Auth] Invalid token payload received');
        throw new UnauthorizedException(
          'Invalid Google token: missing payload',
        );
      }

      const { sub: providerId, email, name } = payload;
      if (!email || !name) {
        console.warn('[Google Auth] Missing email or name in token payload');
        throw new UnauthorizedException(
          'Google account must have email and name',
        );
      }

      const user = await this.validateOAuthUser({
        provider: 'google',
        providerId,
        email,
        name,
      });

      const { accessToken, refreshToken } = await this.generateTokens(user);

      console.log(`[Google Auth] User logged in: ${user.email} (${user._id})`);

      return {
        accessToken,
        refreshToken,
        user: user.toObject(),
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('[Google Auth] Token verification failed:', error.message);
      throw new UnauthorizedException(
        'Failed to verify Google token. Please try again.',
      );
    }
  }
}
