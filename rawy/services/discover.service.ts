/**
 * Discover service — Apple Podcasts discovery and search.
 * Connects to backend /podcasts/discover and /podcasts/search endpoints.
 */

import axiosClient from './axios-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DiscoverPodcast {
  id: string;
  title: string;
  description: string;
  feedUrl: string;
  artworkUrl: string;
  author: string;
  appleId: string;
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Fetch top podcasts from Apple Podcasts API via backend proxy.
 */
export async function getDiscoverPodcasts(): Promise<DiscoverPodcast[]> {
  const { data } = await axiosClient.get<DiscoverPodcast[]>('/podcasts/discover');
  return data ?? [];
}

/**
 * Search external podcasts by keyword via Apple Podcasts API.
 */
export async function searchExternalPodcasts(query: string): Promise<DiscoverPodcast[]> {
  const { data } = await axiosClient.get<DiscoverPodcast[]>('/podcasts/search', {
    params: { q: query },
  });
  return data ?? [];
}
