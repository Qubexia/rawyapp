import { Module } from '@nestjs/common';
import { CommentLikesController } from './comment-likes.controller';
import { CommentLikesService } from './comment-likes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentLike, CommentLikeSchema } from './schemas/comment-like.schema';
import { Comment, CommentSchema } from '../comments/schemas/comment.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [CommentLikesController],
  providers: [CommentLikesService],
})
export class CommentLikesModule {}
