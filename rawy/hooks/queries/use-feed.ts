/**
 * useFeed hook — fetch and manage home feed with followed creators + recommendations.
 */

import { useQuery } from '@tanstack/react-query';
import { getHomeFeed } from '@/services/feed.service';

export const FEED_QUERY_KEY = ['feed'];

/**
 * Key for personalized/trending feed.
 */
export function getHomeFeedQueryKey(page: number, limit: number) {
    return [...FEED_QUERY_KEY, 'home', page, limit];
}

/**
 * Query for home feed episodes.
 * Returns both following-creators list and recommended list.
 */
export function useHomeFeed(page = 1, limit = 10) {
    return useQuery({
        queryKey: getHomeFeedQueryKey(page, limit),
        queryFn: () => getHomeFeed(page, limit),
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 1,
    });
}
