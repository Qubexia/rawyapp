import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Episode,
  EpisodeDocument,
} from '../../episodes/schemas/episode.schema';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(
    @InjectModel(Episode.name) private episodeModel: Model<EpisodeDocument>,
  ) {}

  /**
   * Filters out items that already exist in the database for a given podcast.
   * Leverages the `guid` compound index (podcastId, guid) added in Phase 2.
   */
  async filterNewEpisodes(podcastId: string, items: any[]): Promise<any[]> {
    if (!items || items.length === 0) return [];

    const itemGuids = items.map((item) => item.guid || item.id || item.link);
    const existingEpisodes = await this.episodeModel
      .find(
        {
          podcastId: new Types.ObjectId(podcastId),
          guid: { $in: itemGuids },
        },
        { guid: 1 },
      )
      .lean()
      .exec();

    const existingGuidSet = new Set(existingEpisodes.map((ep) => ep.guid));

    const newItems = items.filter((item) => {
      const guid = item.guid || item.id || item.link;
      return !existingGuidSet.has(guid);
    });

    this.logger.debug(
      `Found ${newItems.length} new episodes out of ${items.length} total for podcast ${podcastId}`,
    );
    return newItems;
  }
}
