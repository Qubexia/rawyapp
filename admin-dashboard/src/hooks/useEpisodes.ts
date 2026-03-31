import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Episode {
  _id: string;
  title: string;
  description: string;
  podcast: {
    _id: string;
    title: string;
  };
  creator: {
    _id: string;
    name: string;
  };
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  audioFileUrl: string;
  createdAt: string;
}

export interface PaginatedEpisodes {
  data: Episode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useEpisodes(page: number = 1, limit: number = 20, podcastId?: string, creatorId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['episodes', page, limit, podcastId, creatorId];

  const query = useQuery<PaginatedEpisodes>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (podcastId) params.append('podcastId', podcastId);
      if (creatorId) params.append('creatorId', creatorId);
      const response = await apiClient.get(`/admin/episodes?${params.toString()}`);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ episodeId, data }: { episodeId: string, data: Partial<Episode> }) => apiClient.patch(`/admin/episodes/${episodeId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (episodeId: string) => apiClient.delete(`/admin/episodes/${episodeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
    },
  });

  return {
    ...query,
    updateEpisode: updateMutation.mutateAsync,
    deleteEpisode: deleteMutation.mutateAsync,
  };
}
