import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FollowsModule } from '../follows/follows.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [FollowsModule, UsersModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
