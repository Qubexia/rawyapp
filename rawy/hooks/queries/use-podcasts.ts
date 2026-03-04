/**
 * React Query hooks for Podcasts.
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPodcasts,
  getPodcast,
  createPodcast,
  updatePodcast,
  deletePodcast,
} from '../../services/podcasts.service';

export const podcastKeys = {
  all: ['podcasts'] as const,
  lists: () => [...podcastKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...podcastKeys.lists(), filters] as const,
  details: () => [...podcastKeys.all, 'detail'] as const,
  detail: (id: string) => [...podcastKeys.details(), id] as const,
};

export function usePodcasts(creatorId?: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: podcastKeys.list({ creatorId }),
    queryFn: ({ pageParam = 1 }) => getPodcasts(pageParam, 20, creatorId),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function usePodcast(id: string) {
  return useQuery({
    queryKey: podcastKeys.detail(id),
    queryFn: () => getPodcast(id),
    enabled: !!id,
  });
}

export function useCreatePodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      coverImage,
    }: {
      data: { title: string; description?: string };
      coverImage?: { uri: string; name: string; type: string };
    }) => createPodcast(data, coverImage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
    },
  });
}

export function useUpdatePodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      coverImage,
    }: {
      id: string;
      data: { title?: string; description?: string };
      coverImage?: { uri: string; name: string; type: string };
    }) => updatePodcast(id, data, coverImage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: podcastKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
    },
  });
}

export function useDeletePodcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePodcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
    },
  });
}
