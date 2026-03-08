import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Types } from 'mongoose';
import { getMessaging } from './firebase.config';
import { FollowsService } from '../follows/follows.service';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @Inject(forwardRef(() => FollowsService))
    private followsService: FollowsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) { }

  async createOrAggregateNotification(
    recipientId: Types.ObjectId,
    type: string,
    lastActorId: Types.ObjectId,
    targetId: Types.ObjectId,
    targetModel: string,
    episodeId?: Types.ObjectId,
    previewText?: string,
  ): Promise<NotificationDocument> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Try to find a recent open notification to aggregate
    const existing = await this.notificationModel.findOne({
      recipientId,
      type,
      targetId,
      updatedAt: { $gt: twentyFourHoursAgo }, // Only aggregate if within 24h
    }).exec();

    if (existing) {
      const currentCount = existing.actorCount + 1;
      existing.actorCount = currentCount;
      existing.lastActorId = lastActorId;
      existing.isRead = false;
      if (previewText) existing.previewText = previewText;
      const saved = await existing.save();

      // T041: Trigger push (except for new_episode which is bulk handled)
      if (type !== 'new_episode') {
        this.sendPushByNotification(recipientId, type, lastActorId, currentCount, previewText, targetId, episodeId);
      }

      return saved;
    }

    // Create new
    const newNotif = new this.notificationModel({
      recipientId,
      type,
      lastActorId,
      actorCount: 1,
      targetId,
      targetModel,
      episodeId,
      previewText,
      isRead: false,
    });
    const saved = await newNotif.save();

    // T041: Trigger push
    if (type !== 'new_episode') {
      this.sendPushByNotification(recipientId, type, lastActorId, 1, previewText, targetId, episodeId);
    }

    return saved;
  }

  private async sendPushByNotification(
    recipientId: Types.ObjectId,
    type: string,
    actorId: Types.ObjectId,
    actorCount: number,
    previewText: string | undefined,
    targetId: Types.ObjectId,
    episodeId?: Types.ObjectId,
  ) {
    try {
      const actor = await this.usersService.findById(actorId.toString());
      if (!actor) return;

      const actorName = actor.name;
      let title = 'New Notification';
      let body = '';

      if (type === 'comment_like') {
        title = 'Comment Liked';
        body = actorCount > 1
          ? `${actorName} and ${actorCount - 1} others liked your comment`
          : `${actorName} liked your comment`;
      } else if (type === 'comment_reply') {
        title = 'New Reply';
        const text = previewText || '';
        body = `${actorName} replied to your comment: ${text}`;
      } else if (type === 'new_follower') {
        title = 'New Follower';
        body = `${actorName} started following you`;
      } else if (type === 'new_episode') {
        title = 'New Episode';
        body = previewText || 'A new episode is out!';
      } else {
        return; // Unknown type, don't send push
      }

      const data: Record<string, string> = {
        type,
        targetId: targetId.toString(),
      };
      if (episodeId) {
        data.episodeId = episodeId.toString();
      }

      await this.sendPush(recipientId, title, body, data);
    } catch (err) {
      this.logger.error(`sendPushByNotification failed: ${err}`);
    }
  }

  async sendPush(
    recipientId: Types.ObjectId,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const user = await this.usersService.findById(recipientId.toString());
    if (!user || !user.pushEnabled || !user.deviceTokens || user.deviceTokens.length === 0) return;

    try {
      const messaging = getMessaging();
      if (!messaging) return;

      const message = {
        notification: { title, body },
        data: data || {},
        tokens: user.deviceTokens,
      };

      const response = await messaging.sendEachForMulticast(message);
      if (response.failureCount > 0) {
        const toRemove: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error && user.deviceTokens[idx]) {
            const code = (resp.error as { code?: string }).code;
            if (
              code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered'
            ) {
              toRemove.push(user.deviceTokens[idx]);
            }
          }
        });
        for (const token of toRemove) {
          await this.usersService.removeDeviceToken(user._id.toString(), token);
        }
      }
    } catch (err) {
      this.logger.error(`sendPush failed for user ${recipientId}: ${err}`);
    }
  }

  async getNotifications(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponseDto<any>> {
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.notificationModel
        .find({ recipientId: userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lastActorId', 'name avatarUrl')
        .exec(),
      this.notificationModel.countDocuments({ recipientId: userId }).exec(),
    ]);

    const data = docs.map((doc) => {
      const obj = doc.toObject() as any;
      return {
        id: obj._id?.toString() || doc._id.toString(),
        recipientId: obj.recipientId?.toString(),
        type: obj.type,
        lastActor: obj.lastActorId ? {
          id: obj.lastActorId._id?.toString(),
          name: obj.lastActorId.name,
          avatarUrl: obj.lastActorId.avatarUrl,
        } : null,
        actorCount: obj.actorCount,
        targetId: obj.targetId?.toString(),
        targetModel: obj.targetModel,
        episodeId: obj.episodeId?.toString(),
        previewText: obj.previewText,
        isRead: obj.isRead,
        createdAt: obj.createdAt || (doc as any).createdAt,
        updatedAt: obj.updatedAt || (doc as any).updatedAt,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getUnreadCount(userId: Types.ObjectId): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId: userId,
      isRead: false,
    }).exec();
  }

  async markAsRead(notificationId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    const result = await this.notificationModel.updateOne(
      { _id: notificationId, recipientId: userId },
      { $set: { isRead: true } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async markAllAsRead(userId: Types.ObjectId): Promise<boolean> {
    const result = await this.notificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { $set: { isRead: true } },
    ).exec();
    return result.modifiedCount > 0;
  }

  async sendNewEpisodeNotification(
    creatorId: Types.ObjectId,
    episodeId: Types.ObjectId,
    episodeTitle: string,
    podcastTitle: string,
  ): Promise<void> {
    const followerIds = await this.followsService.getFollowerIds(creatorId);
    if (followerIds.length === 0) return;

    // 1. Create in-app notifications for each follower (aggregated)
    const previewText = `New episode of ${podcastTitle}: ${episodeTitle}`;
    const notifPromises = followerIds.map((followerId) =>
      this.createOrAggregateNotification(
        followerId,
        'new_episode',
        creatorId,
        episodeId,
        'Episode',
        episodeId,
        previewText
      )
    );
    await Promise.allSettled(notifPromises);

    // 2. Send bulk push (more efficient than individual calls inside aggregate)
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
      if (!messaging) return;
      const message = {
        notification: {
          title: podcastTitle,
          body: `New episode: ${episodeTitle}`,
        },
        data: {
          type: 'new_episode',
          targetId: episodeId.toString(),
          episodeId: episodeId.toString(),
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
      this.logger.error(`sendNewEpisodeNotification push failed: ${err}`);
    }
  }
}
