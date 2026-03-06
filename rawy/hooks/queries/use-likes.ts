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

/** Extract the error message string from any error shape */
function getErrorMessage(err: unknown): string {
  if (!err) return '';
  if (err instanceof Error) return err.message.toLowerCase();
  if (typeof err === 'string') return err.toLowerCase();
  return '';
}

export function useLikedEpisodes(page: number = 1, limit: number = 20, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: likeKeys.likedEpisodes(page),
    queryFn: () => getLikedEpisodes(page, limit),
    ...options,
  });
}

export function useLikeStatus(episodeId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: likeKeys.status(episodeId),
    queryFn: () => getLikeStatus(episodeId),
    enabled: !!episodeId && (options?.enabled !== false),
    // Keep the result fresh for 60 s to avoid showing a stale false state
    // after the user navigates away and returns.
    staleTime: 60_000,
    ...options,
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
      // Sync cache with authoritative server data
      queryClient.setQueryData(likeKeys.status(episodeId), {
        isLiked: data.isLiked,
        likesCount: data.likesCount,
      });
    },
    onError: (err, isCurrentlyLiked, context) => {
      const msg = getErrorMessage(err);

      // Server says "already liked" → the real state is liked=true.
      // Correct the cache instead of rolling back to the stale false value.
      if (msg.includes('already liked')) {
        queryClient.setQueryData(likeKeys.status(episodeId), (old: any) => ({
          isLiked: true,
          likesCount: old?.likesCount ?? 1,
        }));
        return;
      }

      // Server says "not liked" (unliking something not liked) → correct to false.
      if (msg.includes('not liked') || msg.includes('like not found')) {
        queryClient.setQueryData(likeKeys.status(episodeId), (old: any) => ({
          isLiked: false,
          likesCount: Math.max((old?.likesCount ?? 1) - 1, 0),
        }));
        return;
      }

      // Generic error — roll back to the snapshot taken in onMutate
      if (context?.previous) {
        queryClient.setQueryData(likeKeys.status(episodeId), context.previous);
      }
    },
    onSettled: () => {
      // Delay invalidation by 2 s so the corrected optimistic / error-resolved
      // value stays visible long enough; then re-sync with the server.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: likeKeys.status(episodeId) });
      }, 2000);
    },
  });
}
