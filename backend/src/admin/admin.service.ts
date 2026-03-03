import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { CreatorsService } from '../creators/creators.service';
import { PodcastsService } from '../podcasts/podcasts.service';
import { EpisodesService } from '../episodes/episodes.service';
import { CommentsService } from '../comments/comments.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { Role } from '../common/constants/roles.enum';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private creatorsService: CreatorsService,
    private podcastsService: PodcastsService,
    private episodesService: EpisodesService,
    private commentsService: CommentsService,
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

  async removePodcast(podcastId: string): Promise<void> {
    const podcast = await this.podcastsService.findById(podcastId);
    await this.podcastsService.delete(
      podcastId,
      podcast.creatorId as Types.ObjectId,
      'ADMIN',
    );
  }

  async removeEpisode(episodeId: string): Promise<void> {
    const episode = await this.episodesService.findById(episodeId);
    await this.episodesService.delete(
      episodeId,
      episode.creatorId as Types.ObjectId,
      'ADMIN',
    );
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
}
