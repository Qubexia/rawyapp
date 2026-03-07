import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { CreatorsService } from '../creators/creators.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterCreatorDto } from './dto/register-creator.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
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

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
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

      const storedTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!storedTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (user.refreshTokenExpiresAt && new Date() > user.refreshTokenExpiresAt) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

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
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { passwordHash: newPasswordHash });
  }

  async generateTokens(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // ConfigService always returns strings from .env; Number() converts to actual number
    // so jsonwebtoken treats it as seconds (not milliseconds like string "900" would be)
    const accessTtl = Number(this.configService.get('JWT_ACCESS_TTL') ?? 900);
    const refreshTtl = Number(this.configService.get('JWT_REFRESH_TTL') ?? 604800);

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

      user = await this.usersService.update(existingUser._id.toString(), updateData);
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
      throw new Error('Google client ID is not configured');
    }

    const client = new OAuth2Client(clientId);
    
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      const { sub: providerId, email, name } = payload;
      if (!email || !name) {
        throw new UnauthorizedException('Email and name are required from Google');
      }

      const user = await this.validateOAuthUser({
        provider: 'google',
        providerId,
        email,
        name,
      });

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        accessToken,
        refreshToken,
        user: user.toObject(),
      };
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
