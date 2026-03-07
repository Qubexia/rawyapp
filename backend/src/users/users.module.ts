import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { FollowsModule } from '../follows/follows.module';
import { PodcastsModule } from '../podcasts/podcasts.module';
import { CreatorsModule } from '../creators/creators.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => FollowsModule),
    forwardRef(() => PodcastsModule),
    forwardRef(() => CreatorsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
