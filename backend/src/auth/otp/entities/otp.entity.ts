import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OtpPurpose {
  VERIFY_EMAIL = 'verify_email',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
}

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, trim: true, lowercase: true, index: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({
    type: String,
    enum: OtpPurpose,
    required: true,
    index: true,
  })
  purpose: OtpPurpose;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: null })
  lastAttemptAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// T009: Configure Mongoose TTL index on OTP expiresAt field
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ email: 1, purpose: 1 }, { unique: true });
