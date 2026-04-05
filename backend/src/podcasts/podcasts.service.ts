import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
  OnModuleInit,
} from '@nestjs/common';
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
import { AppleApiService } from './services/apple-api.service';
import { SyncService } from '../sync/services/sync.service';
import { UsersService } from '../users/users.service';
import { Role } from '../common/constants/roles.enum';

@Injectable()
export class PodcastsService implements OnModuleInit {
  constructor(
    @InjectModel(Podcast.name) private podcastModel: Model<PodcastDocument>,
    private creatorsService: CreatorsService,
    @Inject(forwardRef(() => EpisodesService))
    private episodesService: EpisodesService,
    @Inject(forwardRef(() => AppleApiService))
    private appleApiService: AppleApiService,
    @Inject(forwardRef(() => SyncService))
    private syncService: SyncService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
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
      const realCount = await this.episodesService.countByPodcastId(
        podcast._id,
      );
      if (podcast.episodeCount !== realCount) {
        await this.podcastModel
          .updateOne(
            { _id: podcast._id },
            { $set: { episodeCount: realCount } },
          )
          .exec();
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

    console.log(
      `[PodcastsService] Created internal podcast: ${savedPodcast._id} by creator ${creatorId}`,
    );

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
   * Find an external podcast by appleId, auto-importing if missing
   */
  async findOrImportApplePodcast(appleId: string): Promise<any> {
    // 1. Check if we already imported it
    let podcast = await this.podcastModel.findOne({ appleId }).exec();
    
    // 2. If not found, import it!
    if (!podcast) {
      const discoverPodcast = await this.appleApiService.lookupPodcast(appleId);
      if (!discoverPodcast) {
        throw new NotFoundException(`Podcast with Apple ID ${appleId} not found`);
      }

      // Assign to ADMIN user
      const admins = await this.usersService.findByRole(Role.ADMIN);
      const systemUserId = admins.length > 0 ? admins[0]._id : new Types.ObjectId();

      const newPodcast = new this.podcastModel({
        title: discoverPodcast.title,
        description: discoverPodcast.description,
        coverImageUrl: discoverPodcast.artworkUrl,
        creatorId: systemUserId,
        episodeCount: 0,
        source: 'external',
        feedUrl: discoverPodcast.feedUrl,
        autoSync: true,
        appleId: appleId,
      });

      podcast = await newPodcast.save();
      
      // Trigger initial sync in background (fire & forget to avoid blocking UI)
      this.syncService.syncPodcast(podcast as any).catch((err: any) => {
        console.error(`Background sync failed for ${podcast?.title}:`, err.message);
      });
    }

    return this.findById(podcast._id.toString());
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
      throw new ForbiddenException(
        'You do not have permission to update this podcast',
      );
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
      throw new ForbiddenException(
        'You do not have permission to delete this podcast',
      );
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
  async findPodcastIdsByCreatorId(
    creatorId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> {
    const podcasts = await this.podcastModel
      .find({ creatorId })
      .select('_id')
      .lean()
      .exec();
    return podcasts.map((p) => p._id);
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
