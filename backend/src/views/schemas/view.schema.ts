import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ViewDocument = View & Document;

@Schema({ timestamps: true })
export class View {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({ type: String, description: 'User who viewed' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Episode', required: true })
  @ApiProperty({ type: String, description: 'Viewed episode' })
  episodeId: Types.ObjectId;

  @ApiProperty({ type: Date, description: 'View timestamp' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Last update date' })
  updatedAt: Date;
}

export const ViewSchema = SchemaFactory.createForClass(View);

// Compound unique: one view per user per episode (idempotent)
ViewSchema.index({ userId: 1, episodeId: 1 }, { unique: true });
// For counting views on an episode
ViewSchema.index({ episodeId: 1 });
