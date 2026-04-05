import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreatorProfile,
  CreatorProfileDocument,
} from './schemas/creator-profile.schema';
import { UpdateCreatorProfileDto } from './dto/update-creator-profile.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectModel(CreatorProfile.name)
    private creatorProfileModel: Model<CreatorProfileDocument>,
  ) {}

  /**
   * Become a creator - elevate user role and create creator profile
   */
  async becomeCreator(
    userId: Types.ObjectId,
    userName: string,
    showName?: string,
    avatarUrl?: string,
  ): Promise<CreatorProfile> {
    // Check if creator profile already exists
    const existingProfile = await this.creatorProfileModel
      .findOne({ userId })
      .exec();
    if (existingProfile) {
      throw new BadRequestException('You are already a creator');
    }

    // Create new creator profile
    const creatorProfile = new this.creatorProfileModel({
      userId,
      followerCount: 0,
      podcastCount: 0,
      showName: showName || userName,
      avatarUrl,
    });

    return creatorProfile.save();
  }

  /**
   * Get creator profile by user ID or profile ID
   */
  async getProfile(
    id: string,
    byUserId: boolean = true,
  ): Promise<CreatorProfile> {
    const filter = byUserId
      ? { userId: new Types.ObjectId(id) }
      : { _id: new Types.ObjectId(id) };
    const profile = await this.creatorProfileModel.findOne(filter).exec();

    if (!profile) {
      throw new NotFoundException('Creator profile not found');
    }

    return profile;
  }

  /**
   * Update creator profile (owner only)
   */
  async updateProfile(
    userId: Types.ObjectId,
    updateCreatorProfileDto: UpdateCreatorProfileDto,
    avatarUrl?: string,
  ): Promise<CreatorProfile> {
    const profile = await this.creatorProfileModel.findOne({ userId }).exec();

    if (!profile) {
      throw new NotFoundException('Creator profile not found');
    }

    const updateData: any = { ...updateCreatorProfileDto };

    // Handle avatar upload
    if (avatarUrl !== undefined) {
      // If new avatar uploaded, delete old one
      if (profile.avatarUrl) {
        try {
          const oldImagePath = join(process.cwd(), profile.avatarUrl);
          await unlink(oldImagePath).catch(() => {});
        } catch (error) {
          // Ignore file deletion errors
        }
      }
      updateData.avatarUrl = avatarUrl;
    }

    const updatedProfile = await this.creatorProfileModel
      .findOneAndUpdate({ userId }, updateData, { new: true })
      .exec();

    if (!updatedProfile) {
      throw new NotFoundException('Creator profile not found');
    }

    return updatedProfile;
  }

  /**
   * List all creators with pagination
   */
  async listCreators(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<CreatorProfile>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.creatorProfileModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.creatorProfileModel.countDocuments().exec(),
    ]);

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
   * Increment follower count (called by FollowsService)
   */
  async incrementFollowerCount(userId: Types.ObjectId): Promise<void> {
    await this.creatorProfileModel
      .updateOne({ userId }, { $inc: { followerCount: 1 } })
      .exec();
  }

  /**
   * Decrement follower count (called by FollowsService)
   */
  async decrementFollowerCount(userId: Types.ObjectId): Promise<void> {
    await this.creatorProfileModel
      .updateOne({ userId }, { $inc: { followerCount: -1 } })
      .exec();
  }

  /**
   * Increment podcast count (called by PodcastsService)
   */
  async incrementPodcastCount(userId: Types.ObjectId): Promise<void> {
    await this.creatorProfileModel
      .updateOne({ userId }, { $inc: { podcastCount: 1 } })
      .exec();
  }

  /**
   * Decrement podcast count (called by PodcastsService)
   */
  async decrementPodcastCount(userId: Types.ObjectId): Promise<void> {
    await this.creatorProfileModel
      .updateOne({ userId }, { $inc: { podcastCount: -1 } })
      .exec();
  }

  /**
   * Check if a user is a creator
   */
  async isCreator(userId: Types.ObjectId): Promise<boolean> {
    const profile = await this.creatorProfileModel.findOne({ userId }).exec();
    return !!profile;
  }

  /**
   * Find creator profile by user ID
   */
  async findByUserId(
    userId: Types.ObjectId,
  ): Promise<CreatorProfileDocument | null> {
    return this.creatorProfileModel.findOne({ userId }).exec();
  }

  /**
   * Find creator profiles by user IDs (for follow lists)
   */
  async getProfilesByUserIds(
    userIds: Types.ObjectId[],
  ): Promise<CreatorProfileDocument[]> {
    if (userIds.length === 0) return [];
    return this.creatorProfileModel.find({ userId: { $in: userIds } }).exec();
  }

  /**
   * Find creator profiles by user IDs with avatarUrl for summary (followers list)
   */
  async getProfilesWithAvatarByUserIds(
    userIds: Types.ObjectId[],
  ): Promise<{ userId: Types.ObjectId; avatarUrl?: string }[]> {
    if (userIds.length === 0) return [];
    const list = await this.creatorProfileModel
      .find({ userId: { $in: userIds } })
      .select('userId avatarUrl')
      .lean()
      .exec();
    return list.map((p) => ({ userId: p.userId, avatarUrl: p.avatarUrl }));
  }

  /**
   * Delete creator profile by user ID (used in account deletion cascade)
   */
  async deleteByUserId(userId: Types.ObjectId): Promise<void> {
    const profile = await this.creatorProfileModel.findOne({ userId }).exec();
    if (profile?.avatarUrl) {
      try {
        const oldPath = join(process.cwd(), profile.avatarUrl);
        await unlink(oldPath).catch(() => {});
      } catch {
        // Ignore file deletion errors
      }
    }
    await this.creatorProfileModel.deleteOne({ userId }).exec();
  }

  /**
   * Get top creators based on follower count and podcast count
   */
  async getTopCreators(limit: number = 10): Promise<CreatorProfile[]> {
    return this.creatorProfileModel
      .find()
      .sort({
        followerCount: -1,
        podcastCount: -1,
        createdAt: -1,
      })
      .limit(limit)
      .exec();
  }
}
