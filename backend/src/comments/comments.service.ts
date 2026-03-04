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

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private episodesService: EpisodesService,
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

    const comment = await this.commentModel.create({
      text: dto.text,
      userId,
      episodeId,
    });

    await this.episodesService.incrementCommentsCount(episodeId);
    
    // Populate user for consistent return
    const populated = await comment.populate('userId', 'name');
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
  ): Promise<PaginatedResponseDto<Comment & { user?: { _id: Types.ObjectId; name: string } }>> {
    await this.episodesService.findById(episodeId.toString());

    const skip = (page - 1) * limit;
    const filter = { episodeId };

    const [rawData, total] = await Promise.all([
      this.commentModel
        .find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name')
        .lean()
        .exec(),
      this.commentModel.countDocuments(filter).exec(),
    ]);

    // Map userId -> user
    const data = rawData.map(({ userId: user, ...rest }: any) => ({
      ...rest,
      user,
    }));

    const totalPages = Math.ceil(total / limit);
    return new PaginatedResponseDto(data as any, total, page, limit);
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

    await this.commentModel.findByIdAndDelete(commentId).exec();
    await this.episodesService.decrementCommentsCount(comment.episodeId);
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
