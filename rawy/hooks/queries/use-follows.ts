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

export const followKeys = {
  all: ['follows'] as const,
  status: (targetId: string) =>
    [...followKeys.all, 'status', targetId] as const,
  following: () => [...followKeys.all, 'following'] as const,
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
      await queryClient.cancelQueries({
        queryKey: followKeys.status(targetId),
      });
      const previous = queryClient.getQueryData(
        followKeys.status(targetId),
      );

      queryClient.setQueryData(
        followKeys.status(targetId),
        (old: any) => ({
          isFollowing: !isCurrentlyFollowing,
          followerCount: old
            ? old.followerCount + (isCurrentlyFollowing ? -1 : 1)
            : isCurrentlyFollowing
              ? 0
              : 1,
        }),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          followKeys.status(targetId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: followKeys.status(targetId),
      });
      queryClient.invalidateQueries({
        queryKey: ['users', targetId, 'public'],
      });
      queryClient.invalidateQueries({ queryKey: followKeys.following() });
    },
  });
}

export function useFollowing(options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: followKeys.following(),
    queryFn: ({ pageParam = 1 }) => getFollowing(pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
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
