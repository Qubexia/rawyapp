import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { getMessaging } from './firebase.config';
import { FollowsService } from '../follows/follows.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private followsService: FollowsService,
    private usersService: UsersService,
  ) {}

  /**
   * Send push notification to all followers of a creator when a new episode is published.
   * Removes invalid FCM tokens from user records on failure.
   */
  async sendNewEpisodeNotification(
    creatorId: Types.ObjectId,
    episodeTitle: string,
    podcastTitle: string,
  ): Promise<void> {
    const followerIds = await this.followsService.getFollowerIds(creatorId);
    if (followerIds.length === 0) return;

    const userTokens = await this.usersService.getDeviceTokensForUserIds(followerIds);
    const tokens: string[] = [];
    const tokenToUserId = new Map<string, string>();
    for (const { userId, tokens: userToks } of userTokens) {
      for (const t of userToks) {
        tokens.push(t);
        tokenToUserId.set(t, userId);
      }
    }
    if (tokens.length === 0) return;

    try {
      const messaging = getMessaging();
      const message = {
        notification: {
          title: podcastTitle,
          body: `New episode: ${episodeTitle}`,
        },
        tokens,
      };
      const batchResponse = await messaging.sendEachForMulticast(message);

      if (batchResponse.failureCount > 0) {
        const toRemove: Array<{ userId: string; token: string }> = [];
        batchResponse.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error && tokens[idx]) {
            const code = (resp.error as { code?: string }).code;
            if (
              code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered'
            ) {
              toRemove.push({ userId: tokenToUserId.get(tokens[idx])!, token: tokens[idx] });
            }
          }
        });
        for (const { userId, token } of toRemove) {
          try {
            await this.usersService.removeDeviceToken(userId, token);
          } catch (err) {
            this.logger.warn(`Failed to remove invalid token for user ${userId}: ${err}`);
          }
        }
      }
    } catch (err) {
      this.logger.error(`sendNewEpisodeNotification failed: ${err}`);
    }
  }
}
