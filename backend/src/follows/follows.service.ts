import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follow, FollowDocument } from './schemas/follow.schema';
import { CreatorsService } from '../creators/creators.service';
import { UsersService } from '../users/users.service';
import { CreatorProfile } from '../creators/schemas/creator-profile.schema';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private creatorsService: CreatorsService,
    private usersService: UsersService,
  ) {}

  /**
   * Follow a creator. Prevents self-follow and duplicate follows.
   * Atomically increments CreatorProfile.followerCount.
   */
  async follow(followerId: Types.ObjectId, creatorId: Types.ObjectId): Promise<{ followerCount: number }> {
    if (followerId.equals(creatorId)) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const creatorProfile = await this.creatorsService.findByUserId(creatorId);
    if (!creatorProfile) {
      throw new NotFoundException('Creator not found');
    }

    try {
      await this.followModel.create({ followerId, creatorId });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
        throw new ConflictException('Already following this creator');
      }
      throw err;
    }

    await this.creatorsService.incrementFollowerCount(creatorId);
    const updatedProfile = await this.creatorsService.findByUserId(creatorId);
    return { followerCount: updatedProfile?.followerCount ?? creatorProfile.followerCount + 1 };
  }

  /**
   * Unfollow a creator. Decrements CreatorProfile.followerCount.
   */
  async unfollow(followerId: Types.ObjectId, creatorId: Types.ObjectId): Promise<{ followerCount: number }> {
    const deleted = await this.followModel
      .findOneAndDelete({ followerId, creatorId })
      .exec();

    if (!deleted) {
      throw new NotFoundException('Not following this creator');
    }

    await this.creatorsService.decrementFollowerCount(creatorId);
    const profile = await this.creatorsService.findByUserId(creatorId);
    return { followerCount: Math.max(0, (profile?.followerCount ?? 1) - 1) };
  }

  /**
   * Check if current user follows a creator and return follower count.
   */
  async getStatus(
    followerId: Types.ObjectId,
    creatorId: Types.ObjectId,
  ): Promise<{ isFollowing: boolean; followerCount: number }> {
    const profile = await this.creatorsService.findByUserId(creatorId);
    if (!profile) {
      throw new NotFoundException('Creator not found');
    }

    const follow = await this.followModel
      .findOne({ followerId, creatorId })
      .exec();

    return {
      isFollowing: !!follow,
      followerCount: profile.followerCount,
    };
  }

  /**
   * Paginated list of creators the user follows (CreatorProfile).
   */
  async getFollowing(
    followerId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<CreatorProfile>> {
    const skip = (page - 1) * limit;

    const followDocs = await this.followModel
      .find({ followerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('creatorId')
      .exec();

    const total = await this.followModel.countDocuments({ followerId }).exec();
    const creatorIds = followDocs.map((f) => f.creatorId);

    const creators = await this.creatorsService.getProfilesByUserIds(creatorIds);

    const orderMap = new Map(creatorIds.map((id, i) => [id.toString(), i]));
    creators.sort((a, b) => orderMap.get(a.userId.toString())! - orderMap.get(b.userId.toString())!);

    const totalPages = Math.ceil(total / limit);
    return {
      data: creators,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get all follower IDs for a creator (e.g. for push notifications).
   */
  async getFollowerIds(creatorId: Types.ObjectId): Promise<Types.ObjectId[]> {
    const docs = await this.followModel
      .find({ creatorId })
      .select('followerId')
      .lean()
      .exec();
    return docs.map((d) => d.followerId as Types.ObjectId);
  }

  /**
   * Paginated list of users following a creator (public).
   * Returns UserSummaryDto shape: id, name, avatarUrl (optional from CreatorProfile).
   */
  async getFollowers(
    creatorId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<{ id: string; name: string; avatarUrl?: string }>> {
    const profile = await this.creatorsService.findByUserId(creatorId);
    if (!profile) {
      throw new NotFoundException('Creator not found');
    }

    const skip = (page - 1) * limit;

    const followDocs = await this.followModel
      .find({ creatorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('followerId')
      .exec();

    const total = await this.followModel.countDocuments({ creatorId }).exec();
    const followerIds = followDocs.map((f) => f.followerId);

    const users = await this.usersService.findByIds(followerIds, 'name');
    const creatorProfiles = await this.creatorsService.getProfilesWithAvatarByUserIds(followerIds);
    const avatarByUserId = new Map(
      creatorProfiles.map((p) => [p.userId.toString(), p.avatarUrl]),
    );

    const orderMap = new Map(followerIds.map((id, i) => [id.toString(), i]));
    const data = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      avatarUrl: avatarByUserId.get(u._id.toString()),
    }));
    data.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
