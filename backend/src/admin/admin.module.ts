import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { CreatorsModule } from '../creators/creators.module';
import { PodcastsModule } from '../podcasts/podcasts.module';
import { EpisodesModule } from '../episodes/episodes.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    UsersModule,
    CreatorsModule,
    PodcastsModule,
    EpisodesModule,
    CommentsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
