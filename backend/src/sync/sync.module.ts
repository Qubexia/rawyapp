import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Podcast, PodcastSchema } from '../podcasts/schemas/podcast.schema';
import { Episode, EpisodeSchema } from '../episodes/schemas/episode.schema';
import { SyncService } from './services/sync.service';
import { RssParserService } from './services/rss-parser.service';
import { DeduplicationService } from './services/deduplication.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Podcast.name, schema: PodcastSchema },
      { name: Episode.name, schema: EpisodeSchema },
    ]),
  ],
  providers: [SyncService, RssParserService, DeduplicationService],
  exports: [SyncService],
})
export class SyncModule {}
