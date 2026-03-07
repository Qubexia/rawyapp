import { Module, forwardRef } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FollowsModule } from '../follows/follows.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    forwardRef(() => FollowsModule),
    forwardRef(() => UsersModule),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
