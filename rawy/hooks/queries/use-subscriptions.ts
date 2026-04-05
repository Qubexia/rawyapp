/**
 * React Query hooks for podcast subscription management.
 */

import { useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import {
  subscribeToPodcast,
  unsubscribeFromPodcast,
  getPodcast,
} from '../../services/podcasts.service';
import { podcastKeys } from './use-podcasts';
import { useMe } from './use-users';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: () => [...subscriptionKeys.all, 'list'] as const,
};

/**
 * Subscribe to a podcast.
 */
export function useSubscribeToPodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (podcastId: string) => subscribeToPodcast(podcastId),
    onSuccess: (_, podcastId) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.list() });
    },
  });
}

/**
 * Unsubscribe from a podcast.
 */
export function useUnsubscribeToPodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (podcastId: string) => unsubscribeFromPodcast(podcastId),
    onSuccess: (_, podcastId) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.list() });
    },
  });
}

/**
 * Fetch all podcast objects that the current user is subscribed to.
 */
export function useMySubscriptions() {
  const { data: myProfile, isLoading: isProfileLoading } = useMe();
  const subscriptionIds = myProfile?.subscriptions || [];

  const queries = useQueries({
    queries: subscriptionIds.map((id) => ({
      queryKey: podcastKeys.detail(id),
      queryFn: () => getPodcast(id),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const isLoading = isProfileLoading || queries.some((q) => q.isLoading);
  const data = queries.map((q) => q.data).filter(Boolean);

  return { data, isLoading };
}
