/**
 * React Query hooks for podcast sync management.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncPodcast } from '../../services/podcasts.service';
import { podcastKeys } from './use-podcasts';
import { episodeKeys } from './use-episodes';

/**
 * Trigger a manual sync for an external podcast.
 * Invalidates both podcast and episode caches on success.
 */
export function useSyncPodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (podcastId: string) => syncPodcast(podcastId),
    onSuccess: (_, podcastId) => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.detail(podcastId) });
      queryClient.invalidateQueries({ queryKey: episodeKeys.lists() });
    },
  });
}
