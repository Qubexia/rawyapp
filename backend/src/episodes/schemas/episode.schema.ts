import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EpisodeDocument = Episode & Document;

@Schema({ timestamps: true })
export class Episode {
  @Prop({ required: true, minlength: 3, maxlength: 200 })
  title: string;

  @Prop({ required: true, minlength: 10, maxlength: 5000 })
  description: string;

  @Prop({ required: true })
  audioFileUrl: string;

  @Prop({ required: false, min: 0 })
  duration?: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Podcast' })
  podcastId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  creatorId: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  viewsCount: number;

  @Prop({ required: true, default: 0, min: 0 })
  likesCount: number;

  @Prop({ required: true, default: 0, min: 0 })
  commentsCount: number;
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);

// Indexes
EpisodeSchema.index({ podcastId: 1, createdAt: -1 });
EpisodeSchema.index({ creatorId: 1 });
EpisodeSchema.index({ createdAt: -1 });
