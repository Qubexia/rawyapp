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
      if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
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
      const like = await this.likeModel
        .findOne({ userId, episodeId })
        .exec();
      isLiked = !!like;
    }

    return {
      isLiked,
      likesCount: episode.likesCount,
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
