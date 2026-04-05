import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { EpisodesModule } from '../episodes/episodes.module';
import { FollowsModule } from '../follows/follows.module';

@Module({
  imports: [EpisodesModule, FollowsModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
