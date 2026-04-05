import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { EpisodesService } from '../episodes/episodes.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private episodesService: EpisodesService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Create a comment and atomically increment Episode.commentsCount.
   */
  async createComment(
    userId: Types.ObjectId,
    episodeId: Types.ObjectId,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    await this.episodesService.findById(episodeId.toString());

    let parentCommentId: Types.ObjectId | null = null;
    if (dto.parentCommentId) {
      const parentComment = await this.commentModel.findById(
        dto.parentCommentId,
      );
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
      // Enforce one-level nesting
      parentCommentId = parentComment.parentCommentId || parentComment._id;
    }

    const commentData: any = {
      text: dto.text,
      userId,
      episodeId,
    };
    if (parentCommentId) {
      commentData.parentCommentId = parentCommentId;
    }

    const comment = await this.commentModel.create(commentData);

    if (dto.parentCommentId) {
      const parentComment = await this.commentModel.findById(
        dto.parentCommentId,
      );
      if (parentComment && !userId.equals(parentComment.userId)) {
        await this.notificationsService.createOrAggregateNotification(
          parentComment.userId,
          'comment_reply',
          userId,
          parentComment._id,
          'Comment',
          episodeId,
          dto.text.substring(0, 100),
        );
      }
    }

    await this.episodesService.incrementCommentsCount(episodeId);

    // Populate user for consistent return
    const populated = await comment.populate('userId', 'name avatarUrl');
    const { userId: user, ...rest } = populated.toObject();
    return { ...rest, user } as any;
  }

  /**
   * Get comments for an episode, paginated, ordered by createdAt ASC.
   * Populates user name (and avatar if available on User).
   */
  async getCommentsByEpisode(
    episodeId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<
    PaginatedResponseDto<
      Comment & {
        user?: { _id: Types.ObjectId; name: string };
        replyCount?: number;
      }
    >
  > {
    await this.episodesService.findById(episodeId.toString());

    const skip = (page - 1) * limit;
    const filter = { episodeId, parentCommentId: { $exists: false } }; // or null

    const [rawData, total] = await Promise.all([
      this.commentModel
        .find({
          ...filter,
          $or: [
            { parentCommentId: null },
            { parentCommentId: { $exists: false } },
          ],
        })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatarUrl')
        .lean()
        .exec(),
      this.commentModel
        .countDocuments({
          ...filter,
          $or: [
            { parentCommentId: null },
            { parentCommentId: { $exists: false } },
          ],
        })
        .exec(),
    ]);

    // Gather reply counts
    const commentIds = rawData.map((c: any) => c._id);
    const repliesAggr = await this.commentModel.aggregate([
      { $match: { parentCommentId: { $in: commentIds } } },
      { $group: { _id: '$parentCommentId', count: { $sum: 1 } } },
    ]);
    const replyCountMap = new Map(
      repliesAggr.map((r: any) => [r._id.toString(), r.count]),
    );

    // Map userId -> user
    const data = rawData.map(({ userId: user, ...rest }: any) => ({
      ...rest,
      user,
      replyCount: replyCountMap.get(rest._id.toString()) || 0,
    }));

    const totalPages = Math.ceil(total / limit);
    return new PaginatedResponseDto(data as any, total, page, limit);
  }

  async getReplies(
    commentId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<
    PaginatedResponseDto<
      Comment & { user?: { _id: Types.ObjectId; name: string } }
    >
  > {
    const skip = (page - 1) * limit;
    const filter = { parentCommentId: commentId };

    const [rawData, total] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort({ createdAt: 1 }) // Or whatever standard order
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatarUrl')
        .lean()
        .exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);

    const data = rawData.map(({ userId: user, ...rest }: any) => ({
      ...rest,
      user,
    }));

    return new PaginatedResponseDto(data as any, total, page, limit);
  }

  /**
   * Find all comments (for admin)
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    episodeId?: string,
  ): Promise<PaginatedResponseDto<any>> {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (episodeId) filter.episodeId = new Types.ObjectId(episodeId);

    const [rawData, total] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatarUrl')
        .populate('episodeId', 'title')
        .lean()
        .exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);

    const data = rawData.map(
      ({ userId: user, episodeId: episode, ...rest }: any) => ({
        ...rest,
        user,
        episode,
      }),
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    } as any;
  }

  /**
   * Delete a comment. Author only or admin. Decrements Episode.commentsCount.
   */
  async deleteComment(
    commentId: Types.ObjectId,
    userId: Types.ObjectId,
    userRole: string,
  ): Promise<void> {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.userId.equals(userId);
    const isAdmin = userRole === 'ADMIN';
    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const childRepliesCount = await this.commentModel.countDocuments({
      parentCommentId: commentId,
    });
    await this.commentModel.deleteMany({ parentCommentId: commentId }).exec();
    await this.commentModel.findByIdAndDelete(commentId).exec();

    const countToDecrement = 1 + childRepliesCount;
    await this.episodesService.decrementCommentsCountBy(
      comment.episodeId,
      countToDecrement,
    );
  }

  /**
   * Find a comment by ID (for admin operations).
   */
  async findById(commentId: Types.ObjectId): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  /**
   * Remove all comments for an episode (cascade cleanup).
   */
  async deleteCommentsForEpisode(episodeId: Types.ObjectId): Promise<void> {
    const count = await this.commentModel.countDocuments({ episodeId }).exec();
    await this.commentModel.deleteMany({ episodeId }).exec();
    await this.episodesService.decrementCommentsCountBy(episodeId, count);
  }
}
