import { Injectable, NotFoundException, ForbiddenException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Episode, EpisodeDocument } from './schemas/episode.schema';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import type { LikesService } from '../likes/likes.service';
import type { CommentsService } from '../comments/comments.service';
import type { ViewsService } from '../views/views.service';
import type { NotificationsService } from '../notifications/notifications.service';
import type { PodcastsService } from '../podcasts/podcasts.service';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectModel(Episode.name) private episodeModel: Model<EpisodeDocument>,
    @Inject(forwardRef(() => require('../notifications/notifications.service').NotificationsService))
    private notificationsService?: NotificationsService,
    @Inject(forwardRef(() => require('../podcasts/podcasts.service').PodcastsService))
    private podcastsService?: PodcastsService,
    @Inject(forwardRef(() => require('../likes/likes.service').LikesService))
    private likesService?: LikesService,
    @Inject(forwardRef(() => require('../comments/comments.service').CommentsService))
    private commentsService?: CommentsService,
    @Inject(forwardRef(() => require('../views/views.service').ViewsService))
    private viewsService?: ViewsService,
  ) {}

  /**
   * Create a new episode
   */
  async create(
    creatorId: Types.ObjectId,
    createEpisodeDto: CreateEpisodeDto,
    audioFileUrl: string,
    imageUrl?: string,
  ): Promise<Episode> {
    const podcastId = new Types.ObjectId(createEpisodeDto.podcastId);

    const episode = new this.episodeModel({
      ...createEpisodeDto,
      podcastId,
      creatorId,
      audioFileUrl,
      imageUrl,
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
    });

    const savedEpisode = await episode.save();

    // Increment Podcast.episodeCount via PodcastsService if available
    if (this.podcastsService) {
      await this.podcastsService.incrementEpisodeCount(podcastId);
    }

    // Notify followers of new episode
    if (this.notificationsService && this.podcastsService) {
      try {
        const podcast = await this.podcastsService.findById(createEpisodeDto.podcastId);
        if (podcast) {
          await this.notificationsService.sendNewEpisodeNotification(
            creatorId,
            savedEpisode.title,
            podcast.title,
          );
        }
      } catch {
        // Don't fail episode creation if notification fails
      }
    }

    return savedEpisode;
  }

  /**
   * Find all episodes with pagination and optional filters
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    podcastId?: string,
    creatorId?: string,
  ): Promise<PaginatedResponseDto<Episode>> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (podcastId) {
      filter.podcastId = new Types.ObjectId(podcastId);
    }

    if (creatorId) {
      filter.creatorId = new Types.ObjectId(creatorId);
    }

    const [rawData, total] = await Promise.all([
      this.episodeModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('podcastId', 'title coverImageUrl')
        .populate('creatorId', 'name avatarUrl')
        .lean()
        .exec(),
      this.episodeModel.countDocuments(filter).exec(),
    ]);

    // Rename podcastId → podcast, creatorId → creator to match frontend expectations
    const data = rawData.map(({ podcastId, creatorId, ...rest }: any) => ({
      ...rest,
      podcast: podcastId,
      creator: creatorId,
    })) as any;

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find an episode by ID
   */
  async findById(id: string): Promise<any> {
    const raw = await this.episodeModel
      .findById(id)
      .populate('podcastId', 'title coverImageUrl')
      .populate('creatorId', 'name avatarUrl')
      .lean()
      .exec();
    if (!raw) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }
    const { podcastId, creatorId, ...rest } = raw as any;
    return { ...rest, podcast: podcastId, creator: creatorId };
  }

  /**
   * Update an episode (owner only)
   */
  async update(
    id: string,
    updateEpisodeDto: UpdateEpisodeDto,
    userId: Types.ObjectId,
    userRole: string,
  ): Promise<Episode> {
    const episode = await this.findById(id);

    // Check ownership or admin access
    if (userRole !== 'ADMIN' && !episode.creator._id.equals(userId)) {
      throw new ForbiddenException('You do not have permission to update this episode');
    }

    const updatedEpisode = await this.episodeModel
      .findByIdAndUpdate(id, updateEpisodeDto, { new: true })
      .exec();

    if (!updatedEpisode) {
      throw new NotFoundException(`Episode with ID ${id} not found`);
    }

    return updatedEpisode;
  }

  /**
   * Delete an episode and cascade delete all related data
   */
  async delete(
    id: string,
    userId: Types.ObjectId,
    userRole: string,
  ): Promise<void> {
    const episode = await this.findById(id);

    // Check ownership or admin access
    if (userRole !== 'ADMIN' && !episode.creator._id.equals(userId)) {
      throw new ForbiddenException('You do not have permission to delete this episode');
    }

    if (this.likesService) {
      await this.likesService.deleteLikesForEpisode(new Types.ObjectId(id));
    }
    if (this.commentsService) {
      await this.commentsService.deleteCommentsForEpisode(new Types.ObjectId(id));
    }
    if (this.viewsService) {
      await this.viewsService.deleteViewsForEpisode(new Types.ObjectId(id));
    }

    // Delete audio file
    if (episode.audioFileUrl) {
      try {
        const audioPath = join(process.cwd(), episode.audioFileUrl);
        await unlink(audioPath).catch(() => {});
      } catch (error) {
        // Ignore file deletion errors
      }
    }

    // Decrement Podcast.episodeCount
    // TODO: Use PodcastsService.decrementEpisodeCount when circular dependency is resolved

    await this.episodeModel.findByIdAndDelete(id).exec();
  }

  /**
   * Increment views count
   */
  async incrementViewsCount(episodeId: Types.ObjectId): Promise<void> {
    await this.episodeModel
      .updateOne({ _id: episodeId }, { $inc: { viewsCount: 1 } })
      .exec();
  }

  /**
   * Increment likes count
   */
  async incrementLikesCount(episodeId: Types.ObjectId): Promise<void> {
    await this.episodeModel
      .updateOne({ _id: episodeId }, { $inc: { likesCount: 1 } })
      .exec();
  }

  /**
   * Decrement likes count
   */
  async decrementLikesCount(episodeId: Types.ObjectId): Promise<void> {
    await this.episodeModel
      .updateOne({ _id: episodeId }, { $inc: { likesCount: -1 } })
      .exec();
  }

  /**
   * Decrement likes count by N (for cascade cleanup)
   */
  async decrementLikesCountBy(episodeId: Types.ObjectId, by: number): Promise<void> {
    if (by <= 0) return;
    await this.episodeModel
      .updateOne({ _id: episodeId }, { $inc: { likesCount: -by } })
      .exec();
  }

  /**
   * Increment comments count
   */
  async incrementCommentsCount(episodeId: Types.ObjectId): Promise<void> {
    await this.episodeModel
      .updateOne({ _id: episodeId }, { $inc: { commentsCount: 1 } })
      .exec();
  }

  /**
   * Decrement comments count
   */
  async decrementCommentsCount(episodeId: Types.ObjectId): Promise<void> {
    await this.episodeModel
      .updateOne({ _id: episodeId }, { $inc: { commentsCount: -1 } })
      .exec();
  }

  /**
   * Decrement comments count by N (for cascade cleanup)
   */
  async decrementCommentsCountBy(episodeId: Types.ObjectId, by: number): Promise<void> {
    if (by <= 0) return;
    await this.episodeModel
      .updateOne({ _id: episodeId }, { $inc: { commentsCount: -by } })
      .exec();
  }

  /**
   * Decrement views count by N (for cascade cleanup)
   */
  async decrementViewsCountBy(episodeId: Types.ObjectId, by: number): Promise<void> {
    if (by <= 0) return;
    await this.episodeModel
      .updateOne({ _id: episodeId }, { $inc: { viewsCount: -by } })
      .exec();
  }

  /**
   * Check if a user owns an episode
   */
  async isOwner(episodeId: string, userId: Types.ObjectId): Promise<boolean> {
    const episode = await this.episodeModel.findOne({
      _id: new Types.ObjectId(episodeId),
      creatorId: userId,
    });
    return !!episode;
  }

  /**
   * Find episodes by podcast ID
   */
  async findByPodcastId(podcastId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponseDto<Episode>> {
    return this.findAll(page, limit, podcastId);
  }

  /**
   * Find multiple episodes by IDs (for liked episodes list).
   * Returns populated episodes in the same order as input IDs.
   */
  async findByIds(ids: Types.ObjectId[]): Promise<any[]> {
    if (ids.length === 0) return [];
    const rawData = await this.episodeModel
      .find({ _id: { $in: ids } })
      .populate('podcastId', 'title coverImageUrl')
      .populate('creatorId', 'name avatarUrl')
      .lean()
      .exec();

    // Rename podcastId → podcast, creatorId → creator
    const mapped = rawData.map(({ podcastId, creatorId, ...rest }: any) => ({
      ...rest,
      podcast: podcastId,
      creator: creatorId,
    }));

    // Preserve order of input IDs
    const idMap = new Map(mapped.map((ep: any) => [ep._id.toString(), ep]));
    return ids.map((id) => idMap.get(id.toString())).filter(Boolean);
  }

  /**
   * Find episodes by creator ID
   */
  async findByCreatorId(creatorId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponseDto<Episode>> {
    return this.findAll(page, limit, undefined, creatorId);
  }

  /**
   * Delete all episodes of a podcast (cascade: likes, comments, views, files). Used when deleting a podcast.
   */
  async deleteAllByPodcastId(podcastId: Types.ObjectId): Promise<void> {
    const episodes = await this.episodeModel.find({ podcastId }).exec();
    for (const ep of episodes) {
      if (this.likesService) await this.likesService.deleteLikesForEpisode(ep._id as Types.ObjectId);
      if (this.commentsService) await this.commentsService.deleteCommentsForEpisode(ep._id as Types.ObjectId);
      if (this.viewsService) await this.viewsService.deleteViewsForEpisode(ep._id as Types.ObjectId);
      if (ep.audioFileUrl) {
        try {
          await unlink(join(process.cwd(), ep.audioFileUrl)).catch(() => {});
        } catch {
          // ignore
        }
      }
      if (this.podcastsService) await this.podcastsService.decrementEpisodeCount(podcastId);
      await this.episodeModel.findByIdAndDelete(ep._id).exec();
    }
  }
}
