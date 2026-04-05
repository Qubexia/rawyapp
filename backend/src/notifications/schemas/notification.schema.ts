import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'new_episode',
      'comment_reply',
      'comment_like',
      'new_follower',
      'admin_broadcast',
    ],
  })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  lastActorId: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  actorCount: number;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ required: true, enum: ['Episode', 'Comment', 'User'] })
  targetModel: string;

  @Prop({ type: Types.ObjectId, ref: 'Episode' })
  episodeId?: Types.ObjectId;

  @Prop({ maxlength: 100 })
  previewText?: string;

  @Prop({ default: false })
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
NotificationSchema.index({ recipientId: 1, isRead: 1, updatedAt: -1 });
NotificationSchema.index(
  { recipientId: 1, type: 1, targetId: 1 },
  { unique: true },
);
