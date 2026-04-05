import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from './schemas/comment-like.schema';
import { Comment, CommentDocument } from '../comments/schemas/comment.schema';
import { CommentLikeStatusDto } from './dto/comment-like.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentLikesService {
  constructor(
    @InjectModel(CommentLike.name)
    private commentLikeModel: Model<CommentLikeDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async like(userId: string, commentId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const existingLike = await this.commentLikeModel.findOne({
      userId: new Types.ObjectId(userId),
      commentId: new Types.ObjectId(commentId),
    });

    if (existingLike)
      throw new ConflictException('Comment already liked by user');

    await this.commentLikeModel.create({
      userId: new Types.ObjectId(userId),
      commentId: new Types.ObjectId(commentId),
    });

    await this.commentModel.findByIdAndUpdate(commentId, {
      $inc: { likesCount: 1 },
    });

    // Trigger notification if liking someone else's comment
    if (userId !== comment.userId.toString()) {
      await this.notificationsService.createOrAggregateNotification(
        comment.userId,
        'comment_like',
        new Types.ObjectId(userId),
        comment._id,
        'Comment',
        comment.episodeId,
        comment.text.substring(0, 100),
      );
    }
  }

  async unlike(userId: string, commentId: string): Promise<void> {
    const result = await this.commentLikeModel.deleteOne({
      userId: new Types.ObjectId(userId),
      commentId: new Types.ObjectId(commentId),
    });

    if (result.deletedCount > 0) {
      await this.commentModel.findByIdAndUpdate(commentId, {
        $inc: { likesCount: -1 },
      });
    } else {
      throw new NotFoundException('Like not found');
    }
  }

  async getStatus(
    userId: string | null,
    commentId: string,
  ): Promise<CommentLikeStatusDto> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    let isLiked = false;
    if (userId) {
      const like = await this.commentLikeModel.findOne({
        userId: new Types.ObjectId(userId),
        commentId: new Types.ObjectId(commentId),
      });
      isLiked = !!like;
    }

    return {
      isLiked,
      likesCount: comment.likesCount || 0,
    };
  }
}
