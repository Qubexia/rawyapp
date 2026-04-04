/**
 * React Query hooks for Episodes.
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEpisodes,
  getEpisode,
  createEpisode,
  createRecordingEpisode,
  updateEpisode,
  deleteEpisode,
} from '../../services/episodes.service';
import { creatorKeys } from './use-creators';
import { podcastKeys } from './use-podcasts';
import { useAuthContext } from '@/context/auth-context';

export const episodeKeys = {
  all: ['episodes'] as const,
  lists: (userId?: string) => [...episodeKeys.all, 'list', userId || 'anonymous'] as const,
  list: (filters: Record<string, unknown>, userId?: string) =>
    [...episodeKeys.lists(userId), filters] as const,
  details: () => [...episodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...episodeKeys.details(), id] as const,
};

export function useEpisodes(podcastId?: string, creatorId?: string) {
  const { user } = useAuthContext();
  return useInfiniteQuery({
    queryKey: episodeKeys.list({ podcastId, creatorId }, user?._id),
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
      imageFile,
      onUploadProgress,
    }: {
      data: {
        title: string;
        description?: string;
        podcastId: string;
        duration?: number;
      };
      audioFile: { uri: string; name: string; type: string };
      imageFile?: { uri: string; name: string; type: string } | null;
      onUploadProgress?: (progressEvent: any) => void;
    }) => createEpisode(data, audioFile, imageFile, onUploadProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: creatorKeys.me() });
      if (variables.data.podcastId) {
        queryClient.invalidateQueries({ queryKey: podcastKeys.detail(variables.data.podcastId) });
      }
      queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
    },
  });
}

export function useRecordEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      recordingUri,
      imageFile,
      onUploadProgress,
    }: {
      data: {
        title: string;
        description?: string;
        podcastId: string;
        duration?: number;
      };
      recordingUri: string;
      imageFile?: { uri: string; name: string; type: string } | null;
      onUploadProgress?: (progressEvent: any) => void;
    }) => createRecordingEpisode(data, recordingUri, imageFile, onUploadProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: creatorKeys.me() });
      if (variables.data.podcastId) {
        queryClient.invalidateQueries({ queryKey: podcastKeys.detail(variables.data.podcastId) });
      }
      queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: podcastKeys.all });
    },
  });
}
