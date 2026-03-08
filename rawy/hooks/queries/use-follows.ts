/**
 * React Query hooks for Follows.
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFollowStatus,
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
} from '../../services/follows.service';
import { creatorKeys } from './use-creators';

export const followKeys = {
  all: ['follows'] as const,
  status: (targetId: string) =>
    [...followKeys.all, 'status', targetId] as const,
  following: (targetId: string) => [...followKeys.all, 'following', targetId] as const,
  followers: (targetId: string) =>
    [...followKeys.all, 'followers', targetId] as const,
};

export function useFollowStatus(targetId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: followKeys.status(targetId),
    queryFn: () => getFollowStatus(targetId),
    enabled: !!targetId && options?.enabled !== false,
    ...options,
  });
}

export function useToggleFollow(targetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isCurrentlyFollowing: boolean) =>
      isCurrentlyFollowing
        ? unfollowUser(targetId)
        : followUser(targetId),
    onMutate: async (isCurrentlyFollowing) => {
      const delta = isCurrentlyFollowing ? -1 : 1;

      // 1. Optimistically update follow-status cache (creator screen counter)
      await queryClient.cancelQueries({
        queryKey: followKeys.status(targetId),
      });
      const previous = queryClient.getQueryData(followKeys.status(targetId));
      queryClient.setQueryData(
        followKeys.status(targetId),
        (old: any) => ({
          isFollowing: !isCurrentlyFollowing,
          followerCount: old ? old.followerCount + delta : isCurrentlyFollowing ? 0 : 1,
        }),
      );

      // 2. Optimistically update followerCount in the Top Creators list (Home)
      await queryClient.cancelQueries({ queryKey: creatorKeys.top() });
      const previousTop = queryClient.getQueryData(creatorKeys.top());
      queryClient.setQueryData(creatorKeys.top(), (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((c: any) =>
          c.userId === targetId
            ? { ...c, followerCount: (c.followerCount ?? 0) + delta }
            : c,
        );
      });

      return { previous, previousTop };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(followKeys.status(targetId), context.previous);
      }
      if (context?.previousTop) {
        queryClient.setQueryData(creatorKeys.top(), context.previousTop);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: followKeys.status(targetId),
      });
      queryClient.invalidateQueries({
        queryKey: ['users', targetId, 'public'],
      });
      queryClient.invalidateQueries({ queryKey: followKeys.following(targetId) });
      // Also refresh creators top list so follower counts update in Home
      queryClient.invalidateQueries({ queryKey: creatorKeys.top() });
    },
  });
}

export function useFollowing(targetId: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: followKeys.following(targetId),
    queryFn: ({ pageParam = 1 }) => getFollowing(targetId, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!targetId && options?.enabled !== false,
    ...options,
  });
}

export function useFollowers(targetId: string) {
  return useInfiniteQuery({
    queryKey: followKeys.followers(targetId),
    queryFn: ({ pageParam = 1 }) => getFollowers(targetId, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!targetId,
  });
}
