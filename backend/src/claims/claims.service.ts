import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ClaimRequest,
  ClaimRequestDocument,
} from './schemas/claim-request.schema';
import { randomBytes } from 'crypto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);

  constructor(
    @InjectModel(ClaimRequest.name)
    private claimRequestModel: Model<ClaimRequestDocument>,
    private authService: AuthService,
  ) {}

  async createRequest(
    userId: string,
    podcastId: string,
  ): Promise<ClaimRequestDocument> {
    const normalizedPodcastId = podcastId?.trim();
    if (!normalizedPodcastId) {
      throw new BadRequestException('podcastId is required');
    }
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const verificationToken = randomBytes(16).toString('hex'); // 32 chars length

    // Optionally check if exists
    const existing = await this.claimRequestModel
      .findOne({
        userId: new Types.ObjectId(userId),
        podcastId: normalizedPodcastId,
      })
      .exec();

    let request;
    if (existing) {
      existing.verificationToken = verificationToken;
      existing.expiresAt = expiresAt;
      existing.status = 'pending';
      existing.requestedAt = new Date();
      request = await existing.save();
    } else {
      request = new this.claimRequestModel({
        userId: new Types.ObjectId(userId),
        podcastId: normalizedPodcastId,
        verificationToken,
        status: 'pending',
        expiresAt,
      });
      await request.save();
    }

    this.logger.log(
      `Created claim request: Verification token for podcast ${podcastId} by user ${userId} is ${verificationToken}`,
    );

    return request;
  }

  async verify(token: string): Promise<any> {
    const claim = await this.claimRequestModel
      .findOne({
        verificationToken: token,
        status: 'pending',
      })
      .exec();

    if (!claim) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    if (new Date() > claim.expiresAt) {
      claim.status = 'expired';
      await claim.save();
      throw new BadRequestException('Verification token has expired');
    }

    claim.status = 'verified';
    claim.verifiedAt = new Date();
    await claim.save();

    this.logger.log(
      `User ${claim.userId} successfully verified claim for podcast ${claim.podcastId}`,
    );

    await this.authService.upgradeToCreator(claim.userId.toString());

    return {
      message: 'Podcast claimed successfully',
      role: 'CREATOR',
    };
  }
}
