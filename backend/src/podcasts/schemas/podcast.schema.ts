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

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  creatorId: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  episodeCount: number;

  @Prop({
    required: false,
    enum: [
      'Technology',
      'Business',
      'Comedy',
      'Education',
      'Health',
      'Science',
      'Culture',
      'Sports',
    ],
  })
  category?: string;

  @Prop({
    required: false,
    enum: ['draft', 'published'],
    default: 'draft',
  })
  status?: 'draft' | 'published';

  @Prop({ required: true, enum: ['external', 'internal'], default: 'internal' })
  source: 'external' | 'internal';

  @Prop({ required: false })
  feedUrl?: string;

  @Prop({ required: true, default: true })
  autoSync: boolean;

  @Prop({ required: false })
  appleId?: string;
}

export const PodcastSchema = SchemaFactory.createForClass(Podcast);

// Indexes
PodcastSchema.index({ creatorId: 1 });
PodcastSchema.index({ creatorId: 1, source: 1 });
PodcastSchema.index({ createdAt: -1 });
PodcastSchema.index({ category: 1 });
PodcastSchema.index({ title: 'text', description: 'text' });
PodcastSchema.index({ status: 1 });
PodcastSchema.index({ feedUrl: 1 }, { unique: true, sparse: true });
