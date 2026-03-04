/**
 * React Query hooks for Likes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLikeStatus,
  likeEpisode,
  unlikeEpisode,
} from '../../services/likes.service';

export const likeKeys = {
  all: ['likes'] as const,
  status: (episodeId: string) => [...likeKeys.all, 'status', episodeId] as const,
};

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
    onError: (_err, _vars, context) => {
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
