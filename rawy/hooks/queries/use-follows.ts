/**
 * React Query hooks for Follows.
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFollowStatus,
  followCreator,
  unfollowCreator,
  getFollowing,
  getFollowers,
} from '../../services/follows.service';

export const followKeys = {
  all: ['follows'] as const,
  status: (creatorId: string) =>
    [...followKeys.all, 'status', creatorId] as const,
  following: () => [...followKeys.all, 'following'] as const,
  followers: (creatorId: string) =>
    [...followKeys.all, 'followers', creatorId] as const,
};

export function useFollowStatus(creatorId: string) {
  return useQuery({
    queryKey: followKeys.status(creatorId),
    queryFn: () => getFollowStatus(creatorId),
    enabled: !!creatorId,
  });
}

export function useToggleFollow(creatorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isCurrentlyFollowing: boolean) =>
      isCurrentlyFollowing
        ? unfollowCreator(creatorId)
        : followCreator(creatorId),
    onMutate: async (isCurrentlyFollowing) => {
      await queryClient.cancelQueries({
        queryKey: followKeys.status(creatorId),
      });
      const previous = queryClient.getQueryData(
        followKeys.status(creatorId),
      );

      queryClient.setQueryData(
        followKeys.status(creatorId),
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
          followKeys.status(creatorId),
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: followKeys.status(creatorId),
      });
      queryClient.invalidateQueries({ queryKey: followKeys.following() });
    },
  });
}

export function useFollowing() {
  return useInfiniteQuery({
    queryKey: followKeys.following(),
    queryFn: ({ pageParam = 1 }) => getFollowing(pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useFollowers(creatorId: string) {
  return useInfiniteQuery({
    queryKey: followKeys.followers(creatorId),
    queryFn: ({ pageParam = 1 }) => getFollowers(creatorId, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!creatorId,
  });
}
