/**
 * React Query hooks for Comments.
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getComments,
  createComment,
  deleteComment,
} from '../../services/comments.service';

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  byEpisode: (episodeId: string) =>
    [...commentKeys.lists(), episodeId] as const,
};

export function useComments(episodeId: string) {
  return useInfiniteQuery({
    queryKey: commentKeys.byEpisode(episodeId),
    queryFn: ({ pageParam = 1 }) => getComments(episodeId, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!episodeId,
  });
}

export function useCreateComment(episodeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => createComment(episodeId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byEpisode(episodeId),
      });
    },
  });
}

export function useDeleteComment(episodeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.byEpisode(episodeId),
      });
    },
  });
}
