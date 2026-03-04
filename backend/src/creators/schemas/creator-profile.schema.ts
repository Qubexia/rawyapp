import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CreatorProfileDocument = CreatorProfile & Document;

@Schema({ timestamps: true })
export class CreatorProfile {
  @ApiProperty({ type: String, description: 'Profile ID' })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  @ApiProperty({ type: String, description: 'User ID (one-to-one with User)' })
  userId: Types.ObjectId;

  @Prop({ type: String, maxlength: 500 })
  @ApiProperty({ type: String, required: false, maxLength: 500, description: 'Creator biography' })
  bio?: string;

  @Prop({ type: String })
  @ApiProperty({ type: String, required: false, description: 'Avatar image file path' })
  avatarUrl?: string;

  @Prop({ type: String, maxlength: 100 })
  @ApiProperty({
    type: String,
    required: false,
    maxLength: 100,
    description: 'Primary show name for the creator',
    example: 'My Awesome Podcast',
  })
  showName?: string;

  @Prop({
    type: {
      website: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      youtube: { type: String },
    },
    required: false,
  })
  @ApiProperty({
    type: Object,
    required: false,
    description: 'Social media links',
    example: { website: 'https://example.com', twitter: '@creator' },
  })
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };

  @Prop({ type: Number, default: 0, min: 0 })
  @ApiProperty({ type: Number, default: 0, minimum: 0, description: 'Denormalized follower count' })
  followerCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  @ApiProperty({ type: Number, default: 0, minimum: 0, description: 'Denormalized podcast count' })
  podcastCount: number;

  @ApiProperty({ type: Date, description: 'Profile creation date' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Last update date' })
  updatedAt: Date;
}

export const CreatorProfileSchema = SchemaFactory.createForClass(CreatorProfile);

// Indexes are defined via decorators above
// - userId: unique, indexed
// Timestamps are automatically added by Mongoose
