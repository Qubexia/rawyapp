/**
 * Feed service — manage personalized and trending home feeds.
 */

import axiosClient from './axios-client';
import type { PaginatedResponse } from './podcasts.service';
import type { Episode } from './episodes.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HomeFeedResponse {
    following: PaginatedResponse<Episode>;
    recommended: PaginatedResponse<Episode>;
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Fetch the home feed data.
 * If authenticated, returns personalized feed from following + recommendations.
 * If unauthenticated, returns only trending recommendations.
 */
export async function getHomeFeed(
    page = 1,
    limit = 10,
): Promise<HomeFeedResponse> {
    const { data } = await axiosClient.get<HomeFeedResponse>('/feed', {
        params: { page, limit },
    });
    return data;
}

export default {
    getHomeFeed,
};
