/**
 * React Query hooks for Comments.
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getComments,
  createComment,
  deleteComment,
  getReplies,
  createReply,
} from '../../services/comments.service';
import { useAuthContext } from '../../context/auth-context';
import type { PaginatedResponse } from '../../services/podcasts.service';
import type { Comment } from '../../services/comments.service';

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  byEpisode: (episodeId: string) =>
    [...commentKeys.lists(), episodeId] as const,
  replies: (commentId: string) =>
    [...commentKeys.all, 'replies', commentId] as const,
};

export function useComments(episodeId: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: commentKeys.byEpisode(episodeId),
    queryFn: ({ pageParam = 1 }) => getComments(episodeId, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!episodeId && options?.enabled !== false,
    ...options,
  });
}

export function useCreateComment(episodeId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: (text: string) => createComment(episodeId, text),
    onMutate: async (newText) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: commentKeys.byEpisode(episodeId) });
      const previousComments = queryClient.getQueryData(commentKeys.byEpisode(episodeId));

      const optimisticComment: Comment = {
        _id: `temp-${Date.now()}`,
        text: newText,
        user: {
          _id: user._id,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        episode: episodeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: 0,
        replyCount: 0,
      };

      queryClient.setQueryData(commentKeys.byEpisode(episodeId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, idx: number) =>
            idx === 0 ? { ...page, data: [optimisticComment, ...page.data] } : page
          ),
        };
      });

      return { previousComments };
    },
    onError: (err, newText, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(commentKeys.byEpisode(episodeId), context.previousComments);
      }
    },
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
      // Optionally could be good to invalidate dependent replies, but this works
    },
  });
}

export function useCommentReplies(commentId: string, options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: commentKeys.replies(commentId),
    queryFn: ({ pageParam = 1 }) => getReplies(commentId, pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!commentId && options?.enabled !== false,
    ...options,
  });
}

export function useCreateReply(episodeId: string, parentCommentId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: (text: string) => createReply(episodeId, text, parentCommentId),
    onMutate: async (newText) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: commentKeys.replies(parentCommentId) });
      const previousReplies = queryClient.getQueryData(commentKeys.replies(parentCommentId));

      const optimisticReply: Comment = {
        _id: `temp-${Date.now()}`,
        text: newText,
        user: {
          _id: user._id,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        episode: episodeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likesCount: 0,
        parentCommentId,
      };

      queryClient.setQueryData(commentKeys.replies(parentCommentId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, idx: number) =>
            idx === 0 ? { ...page, data: [optimisticReply, ...page.data] } : page
          ),
        };
      });

      return { previousReplies };
    },
    onError: (err, newText, context) => {
      if (context?.previousReplies) {
        queryClient.setQueryData(commentKeys.replies(parentCommentId), context.previousReplies);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.replies(parentCommentId),
      });
      // Also invalidate episode comments to update replyCount
      queryClient.invalidateQueries({
        queryKey: commentKeys.byEpisode(episodeId),
      });
    },
  });
}
