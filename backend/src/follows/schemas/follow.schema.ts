import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type FollowDocument = Follow & Document;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({ type: String, description: 'User who follows' })
  followerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({ type: String, description: 'Creator being followed' })
  creatorId: Types.ObjectId;

  @ApiProperty({ type: Date, description: 'Follow timestamp' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Last update date' })
  updatedAt: Date;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Compound unique: prevent duplicate follows
FollowSchema.index({ followerId: 1, creatorId: 1 }, { unique: true });
// For getting a creator's followers
FollowSchema.index({ creatorId: 1 });
// For getting a user's followed creators
FollowSchema.index({ followerId: 1 });
