/**
 * React Query hooks for Apple Podcast discovery and search.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getDiscoverPodcasts,
  searchExternalPodcasts,
} from '../../services/discover.service';

export const discoverKeys = {
  all: ['discover'] as const,
  top: () => [...discoverKeys.all, 'top'] as const,
  search: (query: string) => [...discoverKeys.all, 'search', query] as const,
};

/**
 * Fetch the top podcasts from Apple Podcasts API.
 */
export function useDiscoverPodcasts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: discoverKeys.top(),
    queryFn: getDiscoverPodcasts,
    staleTime: 1000 * 60 * 30, // 30 minutes — Apple top list doesn't change frequently
    enabled: options?.enabled !== false,
  });
}

/**
 * Search external podcasts by keyword.
 * Debouncing should be handled by the caller.
 */
export function useSearchExternalPodcasts(
  query: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: discoverKeys.search(query),
    queryFn: () => searchExternalPodcasts(query),
    enabled: !!query.trim() && options?.enabled !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
