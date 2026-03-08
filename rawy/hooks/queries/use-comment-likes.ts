import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { commentLikesService } from '../../services/comment-likes.service';

import type { CommentLikeStatus } from '../../services/comment-likes.service';

export function useCommentLikeStatus(commentId: string, options?: Omit<UseQueryOptions<CommentLikeStatus, Error, CommentLikeStatus, any>, 'queryKey' | 'queryFn'>) {
    return useQuery<CommentLikeStatus, Error>({
        queryKey: ['commentLikeStatus', commentId],
        queryFn: () => commentLikesService.getCommentLikeStatus(commentId),
        staleTime: 60 * 1000,
        ...options,
    });
}

export function useLikeComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => commentLikesService.likeComment(commentId),
        onMutate: async (commentId) => {
            await queryClient.cancelQueries({ queryKey: ['commentLikeStatus', commentId] });
            const previousStatus = queryClient.getQueryData(['commentLikeStatus', commentId]);

            queryClient.setQueryData(['commentLikeStatus', commentId], (old: any) => {
                if (!old) return { isLiked: true, likesCount: 1 };
                return {
                    ...old,
                    isLiked: true,
                    likesCount: old.likesCount + 1,
                };
            });

            return { previousStatus, commentId };
        },
        onError: (err, commentId, context) => {
            if (context?.previousStatus) {
                queryClient.setQueryData(['commentLikeStatus', context.commentId], context.previousStatus);
            }
        },
        onSettled: (data, error, commentId) => {
            queryClient.invalidateQueries({ queryKey: ['commentLikeStatus', commentId] });
        },
    });
}

export function useUnlikeComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => commentLikesService.unlikeComment(commentId),
        onMutate: async (commentId) => {
            await queryClient.cancelQueries({ queryKey: ['commentLikeStatus', commentId] });
            const previousStatus = queryClient.getQueryData(['commentLikeStatus', commentId]);

            queryClient.setQueryData(['commentLikeStatus', commentId], (old: any) => {
                if (!old) return { isLiked: false, likesCount: 0 };
                return {
                    ...old,
                    isLiked: false,
                    likesCount: Math.max(0, old.likesCount - 1),
                };
            });

            return { previousStatus, commentId };
        },
        onError: (err, commentId, context) => {
            if (context?.previousStatus) {
                queryClient.setQueryData(['commentLikeStatus', context.commentId], context.previousStatus);
            }
        },
        onSettled: (data, error, commentId) => {
            queryClient.invalidateQueries({ queryKey: ['commentLikeStatus', commentId] });
        },
    });
}
