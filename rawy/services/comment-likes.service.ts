import axiosClient from './axios-client';

export interface CommentLikeStatus {
    isLiked: boolean;
    likesCount: number;
}

export const commentLikesService = {
    async likeComment(commentId: string): Promise<void> {
        await axiosClient.post(`/comment-likes/comments/${commentId}`);
    },

    async unlikeComment(commentId: string): Promise<void> {
        await axiosClient.delete(`/comment-likes/comments/${commentId}`);
    },

    async getCommentLikeStatus(commentId: string): Promise<CommentLikeStatus> {
        const { data } = await axiosClient.get<CommentLikeStatus>(`/comment-likes/comments/${commentId}/status`);
        return data;
    },
};
