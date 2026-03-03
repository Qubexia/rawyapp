import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { View, ViewSchema } from './schemas/view.schema';
import { ViewsController } from './views.controller';
import { ViewsService } from './views.service';
import { EpisodesModule } from '../episodes/episodes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: View.name, schema: ViewSchema }]),
    EpisodesModule,
  ],
  controllers: [ViewsController],
  providers: [ViewsService],
  exports: [ViewsService],
})
export class ViewsModule {}
