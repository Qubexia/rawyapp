import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { Otp, OtpSchema } from './entities/otp.entity';
import { EmailService } from './email.service';
import { OtpConfigService } from '../../config/otp.config';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    UsersModule,
  ],
  controllers: [OtpController],
  providers: [OtpService, EmailService, OtpConfigService],
  exports: [OtpService],
})
export class OtpModule {}
