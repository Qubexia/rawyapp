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

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: true, enum: ['external', 'internal'], default: 'internal' })
  source: 'external' | 'internal';

  @Prop({ required: false })
  audioUrl?: string;

  @Prop({ required: false })
  audioStoragePath?: string;

  @Prop({ required: false })
  guid?: string;

  @Prop({ required: true, default: Date.now })
  pubDate: Date;

  @Prop({ required: false })
  artworkUrl?: string;
}

export const EpisodeSchema = SchemaFactory.createForClass(Episode);

// Indexes
EpisodeSchema.index({ podcastId: 1, createdAt: -1 });
EpisodeSchema.index({ creatorId: 1 });
EpisodeSchema.index({ createdAt: -1 });
EpisodeSchema.index({ podcastId: 1, pubDate: -1 });
EpisodeSchema.index({ podcastId: 1, guid: 1 }, { unique: true, sparse: true });

// Virtual for full image URL
EpisodeSchema.virtual('image').get(function () {
  if (!this.imageUrl) return null;
  return `${process.env.APP_URL || 'http://localhost:3000'}${this.imageUrl}`;
});

EpisodeSchema.set('toJSON', { virtuals: true });
EpisodeSchema.set('toObject', { virtuals: true });
