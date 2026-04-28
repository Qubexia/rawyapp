import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../common/constants/roles.enum';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PodcastsService } from '../podcasts/podcasts.service';
import { CreatorsService } from '../creators/creators.service';
import { FollowsService } from '../follows/follows.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => PodcastsService))
    private podcastsService: PodcastsService,
    @Inject(forwardRef(() => CreatorsService))
    private creatorsService: CreatorsService,
    @Inject(forwardRef(() => FollowsService))
    private followsService: FollowsService,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .select('+refreshToken +refreshTokenExpiresAt')
      .exec();
  }

  async findByIdWithPassword(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .select('+passwordHash +refreshToken +refreshTokenExpiresAt')
      .exec();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 20,
    filters?: { role?: Role; isActive?: boolean },
  ): Promise<PaginatedResponseDto<UserDocument>> {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (filters?.role != null) filter.role = filters.role;
    if (filters?.isActive != null) filter.isActive = filters.isActive;
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-passwordHash -refreshToken -refreshTokenExpiresAt')
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data, total, page, limit, totalPages };
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+passwordHash').exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByFacebookId(facebookId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ facebookId }).exec();
  }

  async create(createUserDto: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
    googleId?: string;
    facebookId?: string;
  }): Promise<UserDocument> {
    const newUser = new this.userModel({
      ...createUserDto,
      role: createUserDto.role || Role.USER,
    });
    return newUser.save();
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If there's an old avatar, delete it
    if (user.avatarUrl) {
      try {
        const oldPath = join(process.cwd(), user.avatarUrl);
        await unlink(oldPath).catch(() => {});
      } catch (err) {
        // Ignore deletion errors
      }
    }

    user.avatarUrl = avatarUrl;
    return user.save();
  }

  async update(
    id: string,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
    expiresIn: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        refreshToken,
        refreshTokenExpiresAt: expiresIn,
      })
      .exec();
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1, refreshTokenExpiresAt: 1 },
      })
      .exec();
  }

  async addDeviceToken(userId: string, token: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { deviceTokens: token } },
        { new: true },
      )
      .exec();
  }

  async removeDeviceToken(userId: string, token: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { deviceTokens: token } },
        { new: true },
      )
      .exec();
  }

  async updatePushPreference(userId: string, enabled: boolean): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { pushEnabled: enabled })
      .exec();
  }

  async deactivateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { isActive: false }, { new: true })
      .exec();
  }

  async activateUser(userId: string): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { isActive: true }, { new: true })
      .exec();
  }

  async verifyEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { email },
        { isEmailVerified: true, emailVerifiedAt: new Date(), isActive: true },
        { new: true },
      )
      .exec();
  }

  async updateRole(userId: string, role: Role): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .exec();
  }

  async findByIds(
    ids: Types.ObjectId[],
    select: string = 'name',
  ): Promise<UserDocument[]> {
    if (ids.length === 0) return [];
    return this.userModel
      .find({ _id: { $in: ids } })
      .select(select)
      .exec();
  }

  async incrementFollowerCount(userId: Types.ObjectId): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { $inc: { followerCount: 1 } })
      .exec();
  }

  async decrementFollowerCount(userId: Types.ObjectId): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { $inc: { followerCount: -1 } })
      .exec();
  }

  async incrementFollowingCount(userId: Types.ObjectId): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { $inc: { followingCount: 1 } })
      .exec();
  }

  async decrementFollowingCount(userId: Types.ObjectId): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { $inc: { followingCount: -1 } })
      .exec();
  }

  async getPublicProfile(id: string): Promise<any> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      id: user._id.toString(),
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      city: user.location?.city,
    };
  }

  /**
   * Get device tokens grouped by user ID for the given user IDs (for push notifications).
   */
  async getDeviceTokensForUserIds(
    userIds: Types.ObjectId[],
  ): Promise<Array<{ userId: string; tokens: string[] }>> {
    if (userIds.length === 0) return [];
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('_id deviceTokens')
      .lean()
      .exec();
    return users
      .filter((u) => u.deviceTokens?.length)
      .map((u) => ({
        userId: u._id.toString(),
        tokens: u.deviceTokens || [],
      }));
  }

  /**
   * Delete user account with cascade. Verifies password, then deletes:
   * podcasts (and episodes), creator profile, all follows, and user record.
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Password verification not available for this account',
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    const userIdObj = new Types.ObjectId(userId);

    // 1. Delete all podcasts (cascades to episodes, likes, comments, views, files)
    if (this.podcastsService) {
      const podcastIds =
        await this.podcastsService.findPodcastIdsByCreatorId(userIdObj);
      for (const podcastId of podcastIds) {
        await this.podcastsService.delete(
          podcastId.toString(),
          userIdObj,
          user.role,
        );
      }
    }

    // 2. Delete creator profile (if exists)
    if (this.creatorsService) {
      await this.creatorsService.deleteByUserId(userIdObj);
    }

    // 3. Delete all follows (both directions) and update counts
    if (this.followsService) {
      await this.followsService.deleteAllForUser(userIdObj);
    }

    // 4. Delete user record
    await this.userModel.findByIdAndDelete(userId).exec();
  }

  /**
   * Admin delete user account with cascade. No password verification.
   */
  async adminDeleteUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userIdObj = new Types.ObjectId(userId);

    if (this.podcastsService) {
      const podcastIds =
        await this.podcastsService.findPodcastIdsByCreatorId(userIdObj);
      for (const podcastId of podcastIds) {
        await this.podcastsService.delete(
          podcastId.toString(),
          userIdObj,
          Role.ADMIN,
        );
      }
    }

    if (this.creatorsService) {
      await this.creatorsService.deleteByUserId(userIdObj);
    }

    if (this.followsService) {
      await this.followsService.deleteAllForUser(userIdObj);
    }

    await this.userModel.findByIdAndDelete(userId).exec();
  }

  async findByEmailWithResetOtp(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .select('+passwordHash +passwordResetOtp +passwordResetOtpExpires')
      .exec();
  }

  async setPasswordResetOtp(
    userId: string,
    otpHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        passwordResetOtp: otpHash,
        passwordResetOtpExpires: expiresAt,
      })
      .exec();
  }

  async clearPasswordResetOtp(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $unset: { passwordResetOtp: 1, passwordResetOtpExpires: 1 },
      })
      .exec();
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { passwordHash }).exec();
  }

  async updateLocation(
    userId: string,
    location: { city?: string; coordinates?: number[] },
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { location }, { new: true })
      .exec();
  }

  async findByRole(role: Role): Promise<UserDocument[]> {
    return this.userModel
      .find({ role })
      .select('-passwordHash -refreshToken -refreshTokenExpiresAt')
      .exec();
  }

  async subscribeToPodcast(
    userId: string,
    podcastId: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Check if already subscribed to avoid duplicates
    const pId = new Types.ObjectId(podcastId);
    if (!user.subscriptions.includes(pId)) {
      user.subscriptions.push(pId);
      await user.save();
    }
    return user;
  }

  async unsubscribeFromPodcast(
    userId: string,
    podcastId: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const pId = new Types.ObjectId(podcastId);
    user.subscriptions = user.subscriptions.filter((id) => !id.equals(pId));
    await user.save();

    return user;
  }
}
