import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PodcastDocument = Podcast & Document;

@Schema({ timestamps: true })
export class Podcast {
  @Prop({ required: true, minlength: 3, maxlength: 100 })
  title: string;

  @Prop({ required: true, minlength: 10, maxlength: 2000 })
  description: string;

  @Prop({ required: false })
  coverImageUrl?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  creatorId: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  episodeCount: number;
}

export const PodcastSchema = SchemaFactory.createForClass(Podcast);

// Indexes
PodcastSchema.index({ creatorId: 1 });
PodcastSchema.index({ createdAt: -1 });
