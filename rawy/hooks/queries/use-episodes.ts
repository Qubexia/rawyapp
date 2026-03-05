/**
 * React Query hooks for Episodes.
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEpisodes,
  getEpisode,
  createEpisode,
  updateEpisode,
  deleteEpisode,
} from '../../services/episodes.service';
import { creatorKeys } from './use-creators';

export const episodeKeys = {
  all: ['episodes'] as const,
  lists: () => [...episodeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...episodeKeys.lists(), filters] as const,
  details: () => [...episodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...episodeKeys.details(), id] as const,
};

export function useEpisodes(podcastId?: string, creatorId?: string) {
  return useInfiniteQuery({
    queryKey: episodeKeys.list({ podcastId, creatorId }),
    queryFn: ({ pageParam = 1 }) =>
      getEpisodes(pageParam, 20, podcastId, creatorId),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useEpisode(id: string) {
  return useQuery({
    queryKey: episodeKeys.detail(id),
    queryFn: () => getEpisode(id),
    enabled: !!id,
  });
}

export function useCreateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      audioFile,
    }: {
      data: {
        title: string;
        description?: string;
        podcastId: string;
        duration?: number;
      };
      audioFile: { uri: string; name: string; type: string };
    }) => createEpisode(data, audioFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: creatorKeys.me() });
    },
  });
}

export function useUpdateEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; description?: string };
    }) => updateEpisode(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: episodeKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: episodeKeys.lists() });
    },
  });
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEpisode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: creatorKeys.me() });
    },
  });
}
