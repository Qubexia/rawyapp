import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Podcast,
  PodcastDocument,
} from '../../podcasts/schemas/podcast.schema';
import { Role } from '../constants/roles.enum';

@Injectable()
export class OwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OwnershipGuard.name);

  constructor(
    @InjectModel(Podcast.name) private podcastModel: Model<PodcastDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Support id in params (e.g., /podcasts/:id) or podcastId in body/params
    const resourceId =
      request.params.id || request.params.podcastId || request.body.podcastId;

    if (!user) {
      this.logger.warn('OwnershipGuard requires an authenticated user.');
      return false;
    }

    // Admins can bypass the ownership guard
    if (user.role === Role.ADMIN) {
      return true;
    }

    // If no ID is present, we pass and let validation or controllers handle it.
    // Ensure we only apply ownership validation when targeting a specific resource.
    if (!resourceId) {
      return true;
    }

    if (!Types.ObjectId.isValid(resourceId)) {
      throw new NotFoundException('Invalid Podcast ID');
    }

    const podcast = await this.podcastModel.findById(resourceId).exec();

    if (!podcast) {
      throw new NotFoundException('Podcast not found');
    }

    const userId = user._id?.toString() || user.id?.toString();
    const creatorId = podcast.creatorId.toString();

    if (creatorId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to modify podcast ${resourceId} owned by ${creatorId}`,
      );
      throw new ForbiddenException(
        'You do not have permission to modify this resource',
      );
    }

    // Attach to request to save DB queries down the line
    request.podcast = podcast;

    return true;
  }
}
