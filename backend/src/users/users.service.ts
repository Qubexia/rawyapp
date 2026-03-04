import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../common/constants/roles.enum';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel
      .findById(id)
      .select('+refreshToken +refreshTokenExpiresAt')
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
      this.userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash -refreshToken -refreshTokenExpiresAt').exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { data, total, page, limit, totalPages };
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email })
      .select('+passwordHash')
      .exec();
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

  async updateRole(userId: string, role: Role): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .exec();
  }

  async findByIds(ids: Types.ObjectId[], select: string = 'name'): Promise<UserDocument[]> {
    if (ids.length === 0) return [];
    return this.userModel.find({ _id: { $in: ids } }).select(select).exec();
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
        userId: (u._id as Types.ObjectId).toString(),
        tokens: u.deviceTokens || [],
      }));
  }
}
