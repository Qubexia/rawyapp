import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // MongoDB
        MONGODB_URI: Joi.string().required(),

        // JWT
        JWT_ACCESS_SECRET: Joi.string().required().min(32),
        JWT_REFRESH_SECRET: Joi.string().required().min(32),
        JWT_ACCESS_EXPIRATION: Joi.string()
          .default('15m')
          .pattern(/^\d+[smhd]$/),
        JWT_REFRESH_EXPIRATION: Joi.string()
          .default('7d')
          .pattern(/^\d+[smhd]$/),

        // Google OAuth
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string().required(),

        // Facebook OAuth
        FACEBOOK_APP_ID: Joi.string().required(),
        FACEBOOK_APP_SECRET: Joi.string().required(),
        FACEBOOK_CALLBACK_URL: Joi.string().required(),

        // Firebase
        FIREBASE_SERVICE_ACCOUNT_PATH: Joi.string().required(),

        // Upload limits
        MAX_AUDIO_FILE_SIZE: Joi.number()
          .default(100 * 1024 * 1024) // 100MB
          .min(0),
        MAX_IMAGE_FILE_SIZE: Joi.number()
          .default(5 * 1024 * 1024) // 5MB
          .min(0),

        // Admin seeding
        ADMIN_EMAIL: Joi.string().email().required(),
        ADMIN_PASSWORD: Joi.string().min(8).required(),

        // SMTP
        SMTP_HOST: Joi.string().default('smtp.gmail.com'),
        SMTP_PORT: Joi.number().default(587),
        SMTP_SECURE: Joi.boolean().default(false),
        SMTP_USER: Joi.string().email().allow(''),
        SMTP_PASS: Joi.string().allow(''),
        SMTP_FROM: Joi.string().default('Rawy <no-reply@rawy.app>'),

        // OTP
        OTP_EXPIRY_SECONDS: Joi.number().default(600),
        OTP_MAX_ATTEMPTS: Joi.number().default(5),
        OTP_COOLDOWN_SECONDS: Joi.number().default(60),

        // Port
        PORT: Joi.number().default(3000),

        // Environment
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
      }),
      validationOptions: {
        abortEarly: true,
        allowUnknown: false,
        stripUnknown: true,
      },
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
