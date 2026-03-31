import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Podcast {
  _id: string;
  title: string;
  description: string;
  category: string;
  creator: {
    _id: string;
    name: string;
  };
  episodeCount: number;
  coverImageUrl?: string;
  createdAt: string;
}

export interface PaginatedPodcasts {
  data: Podcast[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function usePodcasts(page: number = 1, limit: number = 20, search?: string, category?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['podcasts', page, limit, search, category];

  const query = useQuery<PaginatedPodcasts>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      const response = await apiClient.get(`/admin/podcasts?${params.toString()}`);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ podcastId, data }: { podcastId: string, data: Partial<Podcast> }) => apiClient.patch(`/admin/podcasts/${podcastId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (podcastId: string) => apiClient.delete(`/admin/podcasts/${podcastId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
    },
  });

  return {
    ...query,
    updatePodcast: updateMutation.mutateAsync,
    deletePodcast: deleteMutation.mutateAsync,
  };
}

export function usePodcast(podcastId: string) {
  return useQuery<Podcast>({
    queryKey: ['podcast', podcastId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/podcasts/${podcastId}`);
      return response.data;
    },
    enabled: !!podcastId,
  });
}
