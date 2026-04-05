import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';
import { Role } from '../../common/constants/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 50 })
  name: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({
    type: String,
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  pushEnabled: boolean;

  @Prop({
    type: {
      city: { type: String },
      coordinates: { type: [Number] },
    },
    _id: false,
  })
  location?: { city?: string; coordinates?: number[] };

  @Prop()
  googleId?: string;

  @Prop()
  facebookId?: string;

  @Prop({ type: [String], default: [] })
  deviceTokens: string[];

  @Prop({ select: false })
  refreshToken?: string;

  @Prop({ select: false })
  refreshTokenExpiresAt?: Date;

  @Prop()
  avatarUrl?: string;

  @Prop({ required: true, default: 0, min: 0 })
  @ApiProperty({ description: 'Number of followers', default: 0 })
  followerCount: number;

  @Prop({ required: true, default: 0, min: 0 })
  @ApiProperty({
    description: 'Number of users this user is following',
    default: 0,
  })
  followingCount: number;

  @Prop({ select: false })
  passwordResetOtp?: string;

  @Prop({ select: false })
  passwordResetOtpExpires?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Podcast' }], default: [] })
  subscriptions: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ facebookId: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
