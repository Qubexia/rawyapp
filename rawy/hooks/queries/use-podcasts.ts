/**
 * React Query hooks for Podcasts.
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPodcasts,
  getPodcast,
  resolvePodcast,
  createPodcast,
  updatePodcast,
  deletePodcast,
} from '../../services/podcasts.service';
import { creatorKeys } from './use-creators';
import { useAuthContext } from '@/context/auth-context';

export const podcastKeys = {
  all: ['podcasts'] as const,
  lists: (userId?: string) => [...podcastKeys.all, 'list', userId || 'anonymous'] as const,
  list: (filters: Record<string, unknown>, userId?: string) =>
    [...podcastKeys.lists(userId), filters] as const,
  details: () => [...podcastKeys.all, 'detail'] as const,
  detail: (id: string) => [...podcastKeys.details(), id] as const,
  resolving: (appleId: string) => [...podcastKeys.all, 'resolve', appleId] as const,
};

export function usePodcasts(
  params?: { creatorId?: string; search?: string; category?: string },
  options?: { enabled?: boolean },
) {
  const { user } = useAuthContext();
  const { creatorId, search, category } = params ?? {};
  return useInfiniteQuery({
    queryKey: podcastKeys.list({ creatorId, search, category }, user?._id),
    queryFn: ({ pageParam = 1 }) =>
      getPodcasts(pageParam, 20, creatorId, search, category),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function usePodcast(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: podcastKeys.detail(id),
    queryFn: () => getPodcast(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useResolvePodcast(appleId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: podcastKeys.resolving(appleId),
    queryFn: () => resolvePodcast(appleId),
    enabled: !!appleId && (options?.enabled ?? true),
    staleTime: Infinity,
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
      queryClient.invalidateQueries({ queryKey: creatorKeys.me() });
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
      queryClient.invalidateQueries({ queryKey: creatorKeys.me() });
    },
  });
}
