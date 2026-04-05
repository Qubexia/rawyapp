import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClaimRequestDocument = ClaimRequest & Document;

@Schema({ timestamps: true })
export class ClaimRequest {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  podcastId: string;

  @Prop({ required: true })
  verificationToken: string;

  @Prop({
    required: true,
    enum: ['pending', 'verified', 'expired'],
    default: 'pending',
  })
  status: 'pending' | 'verified' | 'expired';

  @Prop({ required: true, default: Date.now })
  requestedAt: Date;

  @Prop({ required: false })
  verifiedAt?: Date;

  @Prop({ required: true })
  expiresAt: Date;
}

export const ClaimRequestSchema = SchemaFactory.createForClass(ClaimRequest);

// Indexes
ClaimRequestSchema.index({ verificationToken: 1 }, { unique: true });
ClaimRequestSchema.index({ userId: 1, podcastId: 1 }, { unique: true });
ClaimRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired documents is optional, but setting index allows simple query
