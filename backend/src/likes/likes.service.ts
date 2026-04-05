import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Like, LikeDocument } from './schemas/like.schema';
import { EpisodesService } from '../episodes/episodes.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    private episodesService: EpisodesService,
  ) {}

  /**
   * Like an episode. Prevents duplicate via compound unique index.
   * Atomically increments Episode.likesCount.
   */
  async likeEpisode(
    userId: Types.ObjectId,
    episodeId: Types.ObjectId,
  ): Promise<{ likesCount: number }> {
    await this.episodesService.findById(episodeId.toString());

    try {
      await this.likeModel.create({ userId, episodeId });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictException('Already liked this episode');
      }
      throw err;
    }

    await this.episodesService.incrementLikesCount(episodeId);
    const episode = await this.episodesService.findById(episodeId.toString());
    return { likesCount: episode.likesCount };
  }

  /**
   * Unlike an episode. Decrements Episode.likesCount.
   */
  async unlikeEpisode(
    userId: Types.ObjectId,
    episodeId: Types.ObjectId,
  ): Promise<{ likesCount: number }> {
    const deleted = await this.likeModel
      .findOneAndDelete({ userId, episodeId })
      .exec();

    if (!deleted) {
      throw new NotFoundException('Not liked this episode');
    }

    await this.episodesService.decrementLikesCount(episodeId);
    const episode = await this.episodesService.findById(episodeId.toString());
    return { likesCount: Math.max(0, episode.likesCount) };
  }

  /**
   * Check if user liked episode and return like count.
   */
  async getLikeStatus(
    userId: Types.ObjectId | null,
    episodeId: Types.ObjectId,
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    const episode = await this.episodesService.findById(episodeId.toString());
    let isLiked = false;

    if (userId) {
      const like = await this.likeModel.findOne({ userId, episodeId }).exec();
      isLiked = !!like;
    }

    return {
      isLiked,
      likesCount: episode.likesCount,
    };
  }

  /**
   * Get episodes liked by a user (paginated, with populated episode + podcast data).
   */
  async getLikedEpisodes(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      this.likeModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.likeModel.countDocuments({ userId }).exec(),
    ]);

    const episodeIds = likes.map((l) => l.episodeId);

    // Fetch full episode documents with populated podcast info
    const episodes = await this.episodesService.findByIds(episodeIds);

    const totalPages = Math.ceil(total / limit);

    return {
      data: episodes,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Remove all likes for an episode (cascade cleanup).
   */
  async deleteLikesForEpisode(episodeId: Types.ObjectId): Promise<void> {
    const count = await this.likeModel.countDocuments({ episodeId }).exec();
    await this.likeModel.deleteMany({ episodeId }).exec();
    await this.episodesService.decrementLikesCountBy(episodeId, count);
  }
}
