import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Follow, FollowSchema } from './schemas/follow.schema';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { UsersModule } from '../users/users.module';
import { CreatorsModule } from '../creators/creators.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
    UsersModule,
    CreatorsModule,
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
