import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { View, ViewDocument } from './schemas/view.schema';
import { EpisodesService } from '../episodes/episodes.service';

@Injectable()
export class ViewsService {
  constructor(
    @InjectModel(View.name) private viewModel: Model<ViewDocument>,
    private episodesService: EpisodesService,
  ) {}

  /**
   * Record a view. Idempotent: same user+episode only counted once.
   * Uses findOneAndUpdate with upsert; increments Episode.viewsCount only on new view.
   */
  async recordView(
    userId: Types.ObjectId,
    episodeId: Types.ObjectId,
  ): Promise<{ viewsCount: number; isNewView: boolean }> {
    await this.episodesService.findById(episodeId.toString());

    const existing = await this.viewModel
      .findOne({ userId, episodeId })
      .exec();

    if (existing) {
      const episode = await this.episodesService.findById(episodeId.toString());
      return { viewsCount: episode.viewsCount, isNewView: false };
    }

    await this.viewModel.create({ userId, episodeId });
    await this.episodesService.incrementViewsCount(episodeId);
    const episode = await this.episodesService.findById(episodeId.toString());
    return { viewsCount: episode.viewsCount, isNewView: true };
  }

  /**
   * Remove all views for an episode (cascade cleanup).
   */
  async deleteViewsForEpisode(episodeId: Types.ObjectId): Promise<void> {
    const count = await this.viewModel.countDocuments({ episodeId }).exec();
    await this.viewModel.deleteMany({ episodeId }).exec();
    await this.episodesService.decrementViewsCountBy(episodeId, count);
  }
}
