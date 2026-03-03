import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EpisodesController } from './episodes.controller';
import { EpisodesService } from './episodes.service';
import { Episode, EpisodeSchema } from './schemas/episode.schema';
import { PodcastsModule } from '../podcasts/podcasts.module';
import { LikesModule } from '../likes/likes.module';
import { CommentsModule } from '../comments/comments.module';
import { ViewsModule } from '../views/views.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Episode.name, schema: EpisodeSchema }]),
    forwardRef(() => PodcastsModule),
    forwardRef(() => LikesModule),
    forwardRef(() => CommentsModule),
    forwardRef(() => ViewsModule),
    forwardRef(() => NotificationsModule),
    UsersModule,
  ],
  controllers: [EpisodesController],
  providers: [EpisodesService],
  exports: [EpisodesService],
})
export class EpisodesModule {}
