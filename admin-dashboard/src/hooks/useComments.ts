import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  episode: {
    _id: string;
    title: string;
  };
  parentCommentId?: string;
  createdAt: string;
}

export interface PaginatedComments {
  data: Comment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useComments(page: number = 1, limit: number = 20, episodeId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['comments', page, limit, episodeId];

  const query = useQuery<PaginatedComments>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (episodeId) params.append('episodeId', episodeId);
      const response = await apiClient.get(`/admin/comments?${params.toString()}`);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => apiClient.delete(`/admin/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  return {
    ...query,
    deleteComment: deleteMutation.mutateAsync,
  };
}
