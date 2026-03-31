import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { podcastService } from '@/services/podcastService';
import { CreatePodcastDto, Podcast, PodcastListResponse } from '@/types/podcast';

export function useCreatePodcast() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreatePodcastDto) => podcastService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      setError(null);
    },
    onError: (err: Error | string) => {
      setError(err instanceof Error ? err.message : String(err));
    },
  });

  return {
    createPodcast: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error,
    data: mutation.data as Podcast | undefined,
  };
}

export function usePodcasts(params?: { page?: number; limit?: number }) {
  const { data, isLoading, isError, error, refetch } = useQuery<PodcastListResponse>({
    queryKey: ['podcasts', params],
    queryFn: () => podcastService.getAll(params),
  });

  return {
    podcasts: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    isError,
    error,
    refetch,
  };
}
