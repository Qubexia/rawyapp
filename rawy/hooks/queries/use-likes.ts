/**
 * React Query hooks for Likes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLikeStatus,
  likeEpisode,
  unlikeEpisode,
  getLikedEpisodes,
  LikeResult,
} from '../../services/likes.service';

export const likeKeys = {
  all: ['likes'] as const,
  status: (episodeId: string) => [...likeKeys.all, 'status', episodeId] as const,
  likedEpisodes: (page: number) => [...likeKeys.all, 'liked-episodes', page] as const,
};

export function useLikedEpisodes(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: likeKeys.likedEpisodes(page),
    queryFn: () => getLikedEpisodes(page, limit),
  });
}

export function useLikeStatus(episodeId: string) {
  return useQuery({
    queryKey: likeKeys.status(episodeId),
    queryFn: () => getLikeStatus(episodeId),
    enabled: !!episodeId,
  });
}

export function useToggleLike(episodeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isCurrentlyLiked: boolean) =>
      isCurrentlyLiked ? unlikeEpisode(episodeId) : likeEpisode(episodeId),
    onMutate: async (isCurrentlyLiked) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: likeKeys.status(episodeId) });
      const previous = queryClient.getQueryData(likeKeys.status(episodeId));

      queryClient.setQueryData(likeKeys.status(episodeId), (old: any) => ({
        isLiked: !isCurrentlyLiked,
        likesCount: old
          ? old.likesCount + (isCurrentlyLiked ? -1 : 1)
          : isCurrentlyLiked
            ? 0
            : 1,
      }));

      return { previous };
    },
    onSuccess: (data) => {
      // Sync cache with official data from server
      queryClient.setQueryData(likeKeys.status(episodeId), {
        isLiked: data.isLiked,
        likesCount: data.likesCount,
      });
    },
    onError: (err, _vars, context) => {
      console.error('[Mutation] toggleLike failed:', err);
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          likeKeys.status(episodeId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: likeKeys.status(episodeId) });
    },
  });
}
