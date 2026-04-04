import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreatorsService } from '../creators/creators.service';
import { PodcastsService } from '../podcasts/podcasts.service';
import { EpisodesService } from '../episodes/episodes.service';
import { CommentsService } from '../comments/comments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { CreateEpisodeDto } from '../episodes/dto/create-episode.dto';
import { UpdateEpisodeDto } from '../episodes/dto/update-episode.dto';
import { Role } from '../common/constants/roles.enum';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { NotificationDocument } from '../notifications/schemas/notification.schema';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private usersService: UsersService,
    private creatorsService: CreatorsService,
    private podcastsService: PodcastsService,
    private episodesService: EpisodesService,
    private commentsService: CommentsService,
    private notificationsService: NotificationsService,
  ) {}

  async listUsers(
    dto: AdminQueryDto,
  ): Promise<PaginatedResponseDto<UserDocument>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const filters: { role?: Role; isActive?: boolean } = {};
    if (dto.role != null) filters.role = dto.role;
    if (dto.isActive != null) filters.isActive = dto.isActive;
    return this.usersService.findAllPaginated(page, limit, filters);
  }

  async deactivateUser(userId: string): Promise<UserDocument | null> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.usersService.clearRefreshToken(userId);
    return this.usersService.deactivateUser(userId);
  }

  async activateUser(userId: string): Promise<UserDocument | null> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.usersService.activateUser(userId);
  }

  async promoteUser(
    userId: string,
    role: Role.CREATOR | Role.ADMIN,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === role)
      throw new BadRequestException(`User already has role ${role}`);
    await this.usersService.updateRole(userId, role);
    if (role === Role.CREATOR) {
      const isCreator = await this.creatorsService.isCreator(
        new Types.ObjectId(userId),
      );
      if (!isCreator) {
        await this.creatorsService.becomeCreator(
          new Types.ObjectId(userId),
          user.name,
        );
      }
    }
    return this.usersService.findById(userId);
  }

  async getUserById(userId: string): Promise<UserDocument> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(userId: string, dto: any): Promise<UserDocument | null> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return this.usersService.update(userId, dto);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    await this.usersService.adminDeleteUser(userId);
  }

  async listCreators(dto: AdminQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    return this.creatorsService.listCreators(page, limit);
  }

  async getCreatorById(creatorId: string) {
    return this.creatorsService.getProfile(creatorId, false);
  }

  async updateCreator(creatorId: string, dto: any) {
    const profile = await this.creatorsService.getProfile(creatorId, false);
    return this.creatorsService.updateProfile(profile.userId, dto);
  }

  async removeCreatorStatus(creatorId: string) {
    const profile = await this.creatorsService.getProfile(creatorId, false);
    await this.usersService.updateRole(profile.userId.toString(), Role.USER);
    await this.creatorsService.deleteByUserId(profile.userId);
  }

  async listPodcasts(dto: AdminQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const search = (dto as any).search;
    const category = (dto as any).category;
    return this.podcastsService.findAll(page, limit, undefined, search, category);
  }

  async getPodcastById(podcastId: string) {
    return this.podcastsService.findById(podcastId);
  }

  async updatePodcast(podcastId: string, dto: any, coverImageUrl?: string) {
    const podcast = await this.podcastsService.findById(podcastId);
    let creatorId = podcast.creator;
    if (podcast.creator && podcast.creator._id) {
        creatorId = podcast.creator._id;
    }
    return this.podcastsService.update(podcastId, dto, creatorId, 'ADMIN', coverImageUrl);
  }

  async removePodcast(podcastId: string): Promise<void> {
    const podcast = await this.podcastsService.findById(podcastId);
    await this.podcastsService.delete(
      podcastId,
      podcast.creatorId as Types.ObjectId,
      'ADMIN',
    );
  }

  async listEpisodes(dto: AdminQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const podcastId = (dto as any).podcastId;
    const creatorId = (dto as any).creatorId;
    return this.episodesService.findAll(page, limit, podcastId, creatorId);
  }

  async getEpisodeById(episodeId: string) {
    return this.episodesService.findById(episodeId);
  }

  /**
   * Create an episode for any podcast, attributed to the podcast's original creator.
   * Used by admin dashboard to add episodes on behalf of creators.
   */
  async createEpisode(
    createEpisodeDto: CreateEpisodeDto,
    audioFileUrl: string,
    imageUrl?: string,
  ) {
    // Resolve the podcast to get the original creator
    const podcast = await this.podcastsService.findById(createEpisodeDto.podcastId);
    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }

    // Auto-fill title from filename if not provided
    if (!createEpisodeDto.title || createEpisodeDto.title.trim() === '') {
      throw new BadRequestException('Episode title is required');
    }

    // Get creator ID from the podcast — podcast.creator is the populated user object
    const creatorId = podcast.creator?._id;
    if (!creatorId) {
      throw new BadRequestException('Podcast has no associated creator');
    }

    const episode = await this.episodesService.create(
      new Types.ObjectId(creatorId),
      createEpisodeDto,
      audioFileUrl,
      imageUrl,
    );

    this.logger.log(`Admin created episode ${(episode as any)._id || episode.title} for podcast ${createEpisodeDto.podcastId}`);
    
    return episode;
  }

  /**
   * Update episode metadata (title, description, imageUrl).
   * Does NOT allow audioFileUrl changes.
   */
  async updateEpisode(episodeId: string, dto: UpdateEpisodeDto, imageUrl?: string) {
    // Guard: reject any attempt to change audioFileUrl
    if ((dto as any).audioFileUrl !== undefined) {
      throw new BadRequestException('Audio file cannot be changed after creation');
    }

    // If a new image was uploaded, set imageUrl in the DTO
    if (imageUrl) {
      dto.imageUrl = imageUrl;
    }

    const updated = await this.episodesService.update(episodeId, dto, new Types.ObjectId(), 'ADMIN');
    this.logger.log(`Admin updated episode ${episodeId} metadata`);
    return updated;
  }

  async removeEpisode(episodeId: string): Promise<void> {
    const episode = await this.episodesService.findById(episodeId);
    await this.episodesService.delete(
      episodeId,
      episode.creatorId as Types.ObjectId,
      'ADMIN',
    );
  }

  async listComments(dto: AdminQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const episodeId = (dto as any).episodeId;
    return this.commentsService.findAll(page, limit, episodeId);
  }

  async getCommentById(commentId: string) {
    const comment = await this.commentsService.findById(new Types.ObjectId(commentId));
    await comment.populate('userId', 'name avatarUrl');
    await comment.populate('episodeId', 'title');
    const { userId: user, episodeId: episode, ...rest } = comment.toObject() as any;
    return { ...rest, user, episode };
  }

  async removeComment(commentId: string): Promise<void> {
    const comment = await this.commentsService.findById(
      new Types.ObjectId(commentId),
    );
    await this.commentsService.deleteComment(
      new Types.ObjectId(commentId),
      comment.userId,
      'ADMIN',
    );
  }

  async getStats(): Promise<{
    users: number;
    creators: number;
    podcasts: number;
    episodes: number;
  }> {
    const [usersRes, creatorsRes, podcastsRes, episodesRes] = await Promise.all([
      this.usersService.findAllPaginated(1, 1),
      this.creatorsService.listCreators(1, 1),
      this.podcastsService.findAll(1, 1),
      this.episodesService.findAll(1, 1),
    ]);
    return {
      users: usersRes.total,
      creators: creatorsRes.total,
      podcasts: podcastsRes.total,
      episodes: episodesRes.total,
    };
  }

  async getAnalyticsOverview() {
    const stats = await this.getStats();
    const [recentUsers, recentPodcasts, recentEpisodes] = await Promise.all([
      this.usersService.findAllPaginated(1, 5, {}),
      this.podcastsService.findAll(1, 5),
      this.episodesService.findAll(1, 5),
    ]);
    return {
      ...stats,
      recentUsers: recentUsers.data,
      recentPodcasts: recentPodcasts.data,
      recentEpisodes: recentEpisodes.data,
    };
  }

  async getTopEpisodes(dto: AdminQueryDto) {
    const limit = dto.limit ?? 10;
    return this.episodesService.findTopEpisodes(limit);
  }

  async getTopCreators(dto: AdminQueryDto) {
    const limit = dto.limit ?? 10;
    return this.creatorsService.getTopCreators(limit);
  }

  async listBroadcastNotifications(dto: AdminQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const notifications = await this.notificationsService.findAll(page, limit, 'admin');
    return notifications;
  }

  async broadcastNotification(dto: any, targetRole?: Role) {
    const { title, body } = dto;
    
    let userIds: Types.ObjectId[] = [];
    
    if (targetRole) {
      const users = await this.usersService.findByRole(targetRole);
      userIds = users.map(u => u._id as Types.ObjectId);
    } else {
      const result = await this.usersService.findAllPaginated(1, 1000);
      userIds = result.data.map(u => u._id as Types.ObjectId);
    }

    const results: NotificationDocument[] = [];
    for (const userId of userIds) {
      try {
        const notification = await this.notificationsService.createOrAggregateNotification(
          userId,
          'admin_broadcast',
          new Types.ObjectId(),
          new Types.ObjectId(),
          'User',
          undefined,
          body,
        );
        results.push(notification);
      } catch (error) {
        console.error(`Failed to send notification to ${userId}:`, error);
      }
    }

    return {
      sent: results.length,
      totalRecipients: userIds.length,
      title,
      body,
      targetRole: targetRole || 'ALL',
    };
  }

  async getSystemHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    };
  }

  async getSystemConfig() {
    return {
      appName: 'Rawy Platform',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      apiPrefix: '/api',
      features: {
        userRegistration: true,
        creatorMode: true,
        notifications: true,
        analytics: true,
      },
    };
  }
}
