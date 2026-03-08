import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { EpisodesService } from '../episodes/episodes.service';
import { FollowsService } from '../follows/follows.service';

@Injectable()
export class FeedService {
    constructor(
        private episodesService: EpisodesService,
        private followsService: FollowsService,
    ) { }

    async getPersonalizedFeed(userId: Types.ObjectId, page: number = 1, limit: number = 20) {
        const followingIds = await this.followsService.getAllFollowingIds(userId);

        const following = followingIds.length > 0
            ? await this.episodesService.findByCreators(followingIds, page, limit)
            : { data: [], total: 0, page, limit, totalPages: 0 };

        const recommended = await this.episodesService.findRecommended(page, limit, followingIds);

        return {
            following,
            recommended,
        };
    }

    async getTrendingFeed(page: number = 1, limit: number = 20) {
        const recommended = await this.episodesService.findRecommended(page, limit);
        return {
            following: { data: [], total: 0, page, limit, totalPages: 0 },
            recommended,
        };
    }
}
