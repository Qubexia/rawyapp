import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { FollowsService } from '../follows/follows.service';
import { Role } from '../common/constants/roles.enum';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private followsService: FollowsService,
  ) {}

  /**
   * Get user suggestions based on proximity or interests.
   */
  async getSuggestedUsers(userId: Types.ObjectId, limit: number = 10) {
    const user = await this.userModel.findById(userId).exec();
    const followingIds = await this.followsService.getAllFollowingIds(userId);

    // Exclude current user, people they already follow, and admin users
    const excludeIds = [userId, ...followingIds];

    let suggestedUsers: UserDocument[] = [];

    // 1. Proximity suggestion (if user has location)
    if (user?.location?.coordinates?.length === 2) {
      suggestedUsers = await this.userModel
        .find({
          _id: { $nin: excludeIds },
          isActive: true,
          role: { $ne: Role.ADMIN },
          'location.coordinates': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: user.location.coordinates,
              },
              $maxDistance: 100000, // 100km
            },
          },
        })
        .limit(limit)
        .exec();
    }

    // 2. Fallback: same city (if proximity failed or didn't provide enough users)
    if (suggestedUsers.length < limit && user?.location?.city) {
      const cityUsers = await this.userModel
        .find({
          _id: { $nin: [...excludeIds, ...suggestedUsers.map((u) => u._id)] },
          isActive: true,
          role: { $ne: Role.ADMIN },
          'location.city': user.location.city,
        })
        .sort({ followerCount: -1 })
        .limit(limit - suggestedUsers.length)
        .exec();
      suggestedUsers = [...suggestedUsers, ...cityUsers];
    }

    // 3. Fallback: popular overall
    if (suggestedUsers.length < limit) {
      const moreUsers = await this.userModel
        .find({
          _id: { $nin: [...excludeIds, ...suggestedUsers.map((u) => u._id)] },
          isActive: true,
          role: { $ne: Role.ADMIN },
        })
        .sort({ followerCount: -1 })
        .limit(limit - suggestedUsers.length)
        .exec();
      suggestedUsers = [...suggestedUsers, ...moreUsers];
    }

    return suggestedUsers.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      avatarUrl: u.avatarUrl,
      followerCount: u.followerCount,
      city: u.location?.city,
      role: u.role,
    }));
  }
}
