import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';

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

  async generateTokens(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessTtl = this.configService.get<number>('JWT_ACCESS_TTL');
    const refreshTtl = this.configService.get<number>('JWT_REFRESH_TTL');

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
}
