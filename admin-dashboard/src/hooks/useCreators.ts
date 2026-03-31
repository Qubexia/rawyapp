import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Creator {
  _id: string;
  userId: string;
  showName: string;
  avatarUrl?: string;
  bio?: string;
  followerCount: number;
  podcastCount: number;
  createdAt: string;
}

export interface PaginatedCreators {
  data: Creator[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useCreators(page: number = 1, limit: number = 20) {
  const queryClient = useQueryClient();
  const queryKey = ['creators', page, limit];

  const query = useQuery<PaginatedCreators>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      const response = await apiClient.get(`/admin/creators?${params.toString()}`);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ creatorId, data }: { creatorId: string, data: Partial<Creator> }) => apiClient.patch(`/admin/creators/${creatorId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (creatorId: string) => apiClient.delete(`/admin/creators/${creatorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] });
    },
  });

  return {
    ...query,
    updateCreator: updateMutation.mutateAsync,
    deleteCreator: deleteMutation.mutateAsync,
  };
}

export function useCreator(creatorId: string) {
  return useQuery<Creator>({
    queryKey: ['creator', creatorId],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/creators/${creatorId}`);
      return response.data;
    },
    enabled: !!creatorId,
  });
}
