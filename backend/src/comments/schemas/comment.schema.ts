import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, minlength: 1, maxlength: 1000 })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Episode', required: true, index: true })
  episodeId: Types.ObjectId;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.index({ episodeId: 1, createdAt: 1 });
