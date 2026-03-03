import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { CreatorProfile, CreatorProfileSchema } from './schemas/creator-profile.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CreatorProfile.name, schema: CreatorProfileSchema }]),
    UsersModule,
  ],
  controllers: [CreatorsController],
  providers: [CreatorsService],
  exports: [CreatorsService],
})
export class CreatorsModule {}
