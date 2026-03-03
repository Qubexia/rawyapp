import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type LikeDocument = Like & Document;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({ type: String, description: 'User who liked' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Episode', required: true, index: true })
  @ApiProperty({ type: String, description: 'Liked episode' })
  episodeId: Types.ObjectId;

  @ApiProperty({ type: Date, description: 'Like timestamp' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Last update date' })
  updatedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

// Compound unique: prevent duplicate likes
LikeSchema.index({ userId: 1, episodeId: 1 }, { unique: true });
// For counting likes on an episode
LikeSchema.index({ episodeId: 1 });
