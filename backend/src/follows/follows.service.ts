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
   * Follow a user/creator. Prevents self-follow and duplicate follows.
   * Atomically increments User.followerCount and User.followingCount.
   * Also increments CreatorProfile.followerCount if applicable.
   */
  async follow(followerId: Types.ObjectId, creatorId: Types.ObjectId): Promise<{ followerCount: number }> {
    if (followerId.equals(creatorId)) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Check if target user exists
    const targetUser = await this.usersService.findById(creatorId.toString());
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    try {
      await this.followModel.create({ followerId, creatorId });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && (err as { code?: number }).code === 11000) {
        throw new ConflictException('Already following this user');
      }
      throw err;
    }

    // Update statistics
    await this.usersService.incrementFollowerCount(creatorId);
    await this.usersService.incrementFollowingCount(followerId);

    // If target is a creator, sync their creator profile count too
    const creatorProfile = await this.creatorsService.findByUserId(creatorId);
    if (creatorProfile) {
      await this.creatorsService.incrementFollowerCount(creatorId);
    }

    const updatedUser = await this.usersService.getPublicProfile(creatorId.toString());
    return { followerCount: updatedUser.followerCount };
  }

  /**
   * Unfollow a user/creator. Decrements counts.
   */
  async unfollow(followerId: Types.ObjectId, creatorId: Types.ObjectId): Promise<{ followerCount: number }> {
    const deleted = await this.followModel
      .findOneAndDelete({ followerId, creatorId })
      .exec();

    if (!deleted) {
      throw new NotFoundException('Not following this user');
    }

    // Update statistics
    await this.usersService.decrementFollowerCount(creatorId);
    await this.usersService.decrementFollowingCount(followerId);

    // If target is a creator, sync their creator profile count too
    const creatorProfile = await this.creatorsService.findByUserId(creatorId);
    if (creatorProfile) {
      await this.creatorsService.decrementFollowerCount(creatorId);
    }

    const updatedUser = await this.usersService.getPublicProfile(creatorId.toString());
    return { followerCount: updatedUser.followerCount };
  }

  /**
   * Check if current user follows a user and return follower count.
   */
  async getStatus(
    followerId: Types.ObjectId,
    targetId: Types.ObjectId,
  ): Promise<{ isFollowing: boolean; followerCount: number }> {
    const user = await this.usersService.findById(targetId.toString());
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const follow = await this.followModel
      .findOne({ followerId, creatorId: targetId })
      .exec();

    // Prefer User.followerCount, but check CreatorProfile for fallback/sync if needed
    let followerCount = user.followerCount;
    
    return {
      isFollowing: !!follow,
      followerCount,
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
   * Paginated list of users following a user (public).
   * Returns UserSummaryDto shape: id, name, avatarUrl.
   */
  async getFollowers(
    targetId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<{ id: string; name: string; avatarUrl?: string }>> {
    const user = await this.usersService.findById(targetId.toString());
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const followDocs = await this.followModel
      .find({ creatorId: targetId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('followerId')
      .exec();

    const total = await this.followModel.countDocuments({ creatorId: targetId }).exec();
    const followerIds = followDocs.map((f) => f.followerId);

    const users = await this.usersService.findByIds(followerIds, 'name avatarUrl');
    
    // Attempt to get creator profiles for potentially higher quality or specific avatars
    // though now avatars are also on User model.
    const creatorProfiles = await this.creatorsService.getProfilesWithAvatarByUserIds(followerIds);
    const creatorAvatarByUserId = new Map(
      creatorProfiles.map((p) => [p.userId.toString(), p.avatarUrl]),
    );

    const orderMap = new Map(followerIds.map((id, i) => [id.toString(), i]));
    const data = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      avatarUrl: creatorAvatarByUserId.get(u._id.toString()) || (u as any).avatarUrl,
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

  async isFollowing(followerId: Types.ObjectId, creatorId: Types.ObjectId): Promise<boolean> {
    const follow = await this.followModel.findOne({ followerId, creatorId }).exec();
    return !!follow;
  }
}
