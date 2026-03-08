/**
 * useSuggestions hook — fetch recommended users to follow.
 */

import { useQuery } from '@tanstack/react-query';
import { getSuggestions } from '@/services/suggestions.service';

export const SUGGESTIONS_QUERY_KEY = ['suggestions'];

/**
 * Key for user suggestions query.
 */
export function getSuggestionsQueryKey(limit: number) {
    return [...SUGGESTIONS_QUERY_KEY, limit];
}

/**
 * Hook to fetch suggested users to follow.
 */
export function useSuggestions(limit = 10, options = {}) {
    return useQuery({
        queryKey: getSuggestionsQueryKey(limit),
        queryFn: () => getSuggestions(limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}
