/**
 * React Query hooks for Creators.
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCreators,
  getCreator,
  getMyCreatorProfile,
  becomeCreator,
  updateCreatorProfile,
} from '../../services/creators.service';

export const creatorKeys = {
  all: ['creators'] as const,
  lists: () => [...creatorKeys.all, 'list'] as const,
  details: () => [...creatorKeys.all, 'detail'] as const,
  detail: (id: string) => [...creatorKeys.details(), id] as const,
  me: () => [...creatorKeys.all, 'me'] as const,
};

export function useCreators() {
  return useInfiniteQuery({
    queryKey: creatorKeys.lists(),
    queryFn: ({ pageParam = 1 }) => getCreators(pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useCreator(id: string) {
  return useQuery({
    queryKey: creatorKeys.detail(id),
    queryFn: () => getCreator(id),
    enabled: !!id,
  });
}

export function useMyCreatorProfile() {
  return useQuery({
    queryKey: creatorKeys.me(),
    queryFn: () => getMyCreatorProfile(),
  });
}

export function useBecomeCreator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (showName?: string) => becomeCreator({ showName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.me() });
    },
  });
}

export function useUpdateCreatorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      avatar,
    }: {
      data: {
        bio?: string;
        socialLinks?: {
          website?: string;
          twitter?: string;
          instagram?: string;
          youtube?: string;
        };
      };
      avatar?: { uri: string; name: string; type: string };
    }) => updateCreatorProfile(data, avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.me() });
    },
  });
}
