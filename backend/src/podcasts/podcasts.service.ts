import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Podcast, PodcastDocument } from './schemas/podcast.schema';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { UpdatePodcastDto } from './dto/update-podcast.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { CreatorsService } from '../creators/creators.service';
import { EpisodesService } from '../episodes/episodes.service';

@Injectable()
export class PodcastsService implements OnModuleInit {
  constructor(
    @InjectModel(Podcast.name) private podcastModel: Model<PodcastDocument>,
    private creatorsService: CreatorsService,
    @Inject(forwardRef(() => EpisodesService))
    private episodesService: EpisodesService,
  ) {}

  async onModuleInit() {
    // Perform a one-time sync of episode counts when the module starts
    // This fixes counts that went out of sync before the decrement logic was added
    console.log('Syncing all podcast episode counts...');
    await this.syncAllEpisodeCounts();
    console.log('Podcast episode count sync complete.');
  }

  async syncAllEpisodeCounts() {
    const podcasts = await this.podcastModel.find({}).exec();
    for (const podcast of podcasts) {
      const realCount = await this.episodesService.countByPodcastId(podcast._id as Types.ObjectId);
      if (podcast.episodeCount !== realCount) {
        await this.podcastModel.updateOne(
          { _id: podcast._id },
          { $set: { episodeCount: realCount } }
        ).exec();
      }
    }
  }

  /**
   * Create a new podcast
   */
  async create(
    creatorId: Types.ObjectId,
    createPodcastDto: CreatePodcastDto,
    coverImageUrl?: string,
  ): Promise<Podcast> {
    const podcast = new this.podcastModel({
      ...createPodcastDto,
      creatorId,
      coverImageUrl,
      episodeCount: 0,
    });

    const savedPodcast = await podcast.save();

    // Increment CreatorProfile.podcastCount
    await this.creatorsService.incrementPodcastCount(creatorId);

    return savedPodcast;
  }

  /**
   * Find all podcasts with pagination and optional creator, search, and category filters
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    creatorId?: string,
    search?: string,
    category?: string,
  ): Promise<PaginatedResponseDto<Podcast>> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (creatorId) {
      filter.creatorId = new Types.ObjectId(creatorId);
    }

    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    if (category && category.trim() && category !== 'All') {
      filter.category = category.trim();
    }

    const [rawData, total] = await Promise.all([
      this.podcastModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name avatarUrl')
        .lean()
        .exec(),
      this.podcastModel.countDocuments(filter).exec(),
    ]);

    // Rename creatorId → creator to match frontend expectations
    const data = rawData.map(({ creatorId, ...rest }: any) => ({
      ...rest,
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
   * Find a podcast by ID
   */
  async findById(id: string): Promise<any> {
    const raw = await this.podcastModel
      .findById(id)
      .populate('creatorId', 'name avatarUrl')
      .lean()
      .exec();
    if (!raw) {
      throw new NotFoundException(`Podcast with ID ${id} not found`);
    }
    const { creatorId, ...rest } = raw as any;
    return { ...rest, creator: creatorId };
  }

  /**
   * Update a podcast (owner only)
   */
  async update(
    id: string,
    updatePodcastDto: UpdatePodcastDto,
    userId: Types.ObjectId,
    userRole: string,
    coverImageUrl?: string,
  ): Promise<Podcast> {
    const podcast = await this.findById(id);

    // Check ownership or admin access
    if (userRole !== 'ADMIN' && !podcast.creator._id.equals(userId)) {
      throw new ForbiddenException('You do not have permission to update this podcast');
    }

    const updateData: any = { ...updatePodcastDto };
    if (coverImageUrl !== undefined) {
      // If new image uploaded, delete old one
      if (podcast.coverImageUrl) {
        try {
          const oldImagePath = join(process.cwd(), podcast.coverImageUrl);
          await unlink(oldImagePath).catch(() => {});
        } catch (error) {
          // Ignore file deletion errors
        }
      }
      updateData.coverImageUrl = coverImageUrl;
    }

    const updatedPodcast = await this.podcastModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    
    if (!updatedPodcast) {
      throw new NotFoundException(`Podcast with ID ${id} not found`);
    }
    
    return updatedPodcast;
  }

  /**
   * Delete a podcast and cascade delete all related data
   */
  async delete(
    id: string,
    userId: Types.ObjectId,
    userRole: string,
  ): Promise<void> {
    const podcast = await this.findById(id);

    // Check ownership or admin access
    if (userRole !== 'ADMIN' && !podcast.creator._id.equals(userId)) {
      throw new ForbiddenException('You do not have permission to delete this podcast');
    }

    // Cascade delete all episodes (likes, comments, views, files)
    await this.episodesService.deleteAllByPodcastId(new Types.ObjectId(id));

    // Delete cover image if exists
    if (podcast.coverImageUrl) {
      try {
        const imagePath = join(process.cwd(), podcast.coverImageUrl);
        await unlink(imagePath).catch(() => {});
      } catch (error) {
        // Ignore file deletion errors
      }
    }

    // Decrement CreatorProfile.podcastCount
    await this.creatorsService.decrementPodcastCount(podcast.creator._id);

    await this.podcastModel.findByIdAndDelete(id).exec();
  }

  /**
   * Increment episode count (called by EpisodesService)
   */
  async incrementEpisodeCount(podcastId: Types.ObjectId): Promise<void> {
    await this.podcastModel
      .updateOne({ _id: podcastId }, { $inc: { episodeCount: 1 } })
      .exec();
  }

  /**
   * Decrement episode count (called by EpisodesService)
   */
  async decrementEpisodeCount(podcastId: Types.ObjectId): Promise<void> {
    await this.podcastModel
      .updateOne({ _id: podcastId }, { $inc: { episodeCount: -1 } })
      .exec();
  }

  /**
   * Find all podcast IDs for a creator (used for cascade delete)
   */
  async findPodcastIdsByCreatorId(creatorId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const podcasts = await this.podcastModel
      .find({ creatorId })
      .select('_id')
      .lean()
      .exec();
    return podcasts.map((p) => p._id as Types.ObjectId);
  }

  /**
   * Check if a user owns a podcast
   */
  async isOwner(podcastId: string, userId: Types.ObjectId): Promise<boolean> {
    const podcast = await this.podcastModel.findOne({
      _id: new Types.ObjectId(podcastId),
      creatorId: userId,
    });
    return !!podcast;
  }
}
