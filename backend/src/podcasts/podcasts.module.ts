import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PodcastsController } from './podcasts.controller';
import { PodcastsService } from './podcasts.service';
import { Podcast, PodcastSchema } from './schemas/podcast.schema';
import { UsersModule } from '../users/users.module';
import { CreatorsModule } from '../creators/creators.module';
import { EpisodesModule } from '../episodes/episodes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Podcast.name, schema: PodcastSchema }]),
    forwardRef(() => UsersModule),
    CreatorsModule,
    forwardRef(() => EpisodesModule),
  ],
  controllers: [PodcastsController],
  providers: [PodcastsService],
  exports: [PodcastsService],
})
export class PodcastsModule {}
