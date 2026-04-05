import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AppleApiService } from './services/apple-api.service';
import { PodcastsController } from './podcasts.controller';
import { PodcastsService } from './podcasts.service';
import { Podcast, PodcastSchema } from './schemas/podcast.schema';
import { UsersModule } from '../users/users.module';
import { CreatorsModule } from '../creators/creators.module';
import { EpisodesModule } from '../episodes/episodes.module';

import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Podcast.name, schema: PodcastSchema }]),
    HttpModule,
    forwardRef(() => UsersModule),
    CreatorsModule,
    forwardRef(() => EpisodesModule),
    forwardRef(() => SyncModule),
  ],
  controllers: [PodcastsController],
  providers: [PodcastsService, AppleApiService],
  exports: [PodcastsService, AppleApiService],
})
export class PodcastsModule {}
