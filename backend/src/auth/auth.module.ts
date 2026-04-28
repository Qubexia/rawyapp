import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { UsersModule } from '../users/users.module';
import { CreatorsModule } from '../creators/creators.module';
import { EmailService } from '../common/services/email.service';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    UsersModule,
    CreatorsModule,
    PassportModule,
    OtpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          // ConfigService always returns strings from .env; Number() converts to actual number
          // so jsonwebtoken treats it as seconds (not milliseconds like string "900" would be)
          expiresIn: Number(configService.get('JWT_ACCESS_TTL') ?? 900),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
    EmailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
