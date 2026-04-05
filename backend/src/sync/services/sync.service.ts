import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Podcast,
  PodcastDocument,
} from '../../podcasts/schemas/podcast.schema';
import {
  Episode,
  EpisodeDocument,
} from '../../episodes/schemas/episode.schema';
import { RssParserService } from './rss-parser.service';
import { DeduplicationService } from './deduplication.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectModel(Podcast.name) private podcastModel: Model<PodcastDocument>,
    @InjectModel(Episode.name) private episodeModel: Model<EpisodeDocument>,
    private readonly rssParserService: RssParserService,
    private readonly deduplicationService: DeduplicationService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCron() {
    this.logger.log('Starting scheduled podcast sync job (runs every 6 hours)');

    // T057: Data fencing - skip internal podcasts during external sync
    const podcastsToSync = await this.podcastModel
      .find({
        source: 'external',
        autoSync: true,
        feedUrl: { $exists: true, $ne: '' },
      })
      .exec();

    this.logger.log(`Found ${podcastsToSync.length} external podcasts to sync`);

    let successCount = 0;
    let failCount = 0;

    for (const podcast of podcastsToSync) {
      try {
        await this.syncPodcast(podcast);
        successCount++;
      } catch (error) {
        this.logger.error(
          `Failed to sync podcast: ${podcast.title} (${podcast._id})`,
          error?.stack,
        );
        failCount++;
      }
    }

    this.logger.log(
      `Sync job completed. Success: ${successCount}, Failures: ${failCount}`,
    );
  }

  async syncPodcastById(podcastId: string): Promise<void> {
    const podcast = await this.podcastModel.findById(podcastId).exec();
    if (!podcast) {
      throw new Error('Podcast not found');
    }
    if (podcast.source === 'internal') {
      throw new Error('Cannot sync internal podcasts');
    }
    if (!podcast.feedUrl) {
      throw new Error('Podcast has no feed URL');
    }
    await this.syncPodcast(podcast);
  }

  async syncPodcast(podcast: PodcastDocument): Promise<void> {
    this.logger.log(`Syncing podcast: ${podcast.title}`);

    const feed = await this.rssParserService.parseFeed(podcast.feedUrl!);

    // Convert items safely
    const newItems = await this.deduplicationService.filterNewEpisodes(
      podcast._id.toString(),
      feed.items,
    );

    if (newItems.length === 0) {
      this.logger.debug(`No new episodes found for podcast: ${podcast.title}`);
      return;
    }

    // Prepare Bulk Write for raw efficiency
    const operations = newItems.map((item) => {
      const guid = item.guid || item.id || item.link;
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();

      const durationStr = item.itunes?.duration || item.itunesDuration || '0';
      let duration = 0;
      if (typeof durationStr === 'string' && durationStr.includes(':')) {
        const parts = durationStr.split(':').map(Number);
        if (parts.length === 3)
          duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) duration = parts[0] * 60 + parts[1];
      } else {
        duration = parseInt(durationStr, 10) || 0;
      }

      return {
        updateOne: {
          filter: { podcastId: podcast._id, guid },
          update: {
            $set: {
              title: item.title || 'Untitled Episode',
              description: item.contentSnippet || item.content || '',
              podcastId: podcast._id,
              creatorId: podcast.creatorId,
              audioFileUrl: item.enclosure?.url || '',
              source: 'external',
              guid,
              pubDate,
              duration,
              viewsCount: 0,
              likesCount: 0,
              commentsCount: 0,
              artworkUrl:
                item.itunes?.image ||
                item.itunesImage?.href ||
                podcast.coverImageUrl ||
                '',
            },
          },
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      await this.episodeModel.bulkWrite(operations as any);

      // Update count on parent podcast
      const totalCount = await this.episodeModel
        .countDocuments({ podcastId: podcast._id })
        .exec();
      podcast.episodeCount = totalCount;
      await podcast.save();

      this.logger.log(
        `Successfully synced ${newItems.length} episodes to ${podcast.title}`,
      );
    }
  }
}
