import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { episodeService } from '@/services/episodeService';
import { CreateEpisodeDto, Episode, EpisodeListResponse } from '@/types/episode';

export function useCreateEpisode() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreateEpisodeDto) => episodeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setError(null);
    },
    onError: (err: Error | string) => {
      setError(err instanceof Error ? err.message : String(err));
    },
  });

  return {
    createEpisode: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error,
    data: mutation.data as Episode | undefined,
  };
}

export function useEpisodes(podcastId?: string, params?: { page?: number; limit?: number }) {
  const queryKey = podcastId 
    ? ['episodes', 'podcast', podcastId, params] 
    : ['episodes', params];

  const { data, isLoading, isError, error, refetch } = useQuery<EpisodeListResponse>({
    queryKey,
    queryFn: () => podcastId 
      ? episodeService.getByPodcast(podcastId, params)
      : episodeService.getAll(params),
    enabled: !podcastId || !!podcastId,
  });

  return {
    episodes: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useEpisode(episodeId: string) {
  return useQuery<Episode>({
    queryKey: ['episode', episodeId],
    queryFn: () => episodeService.getById(episodeId),
    enabled: !!episodeId,
  });
}
