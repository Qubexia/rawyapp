import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, IconButton, useTheme, Surface } from 'react-native-paper';
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { Comment } from '@/services/comments.service';
import { formatRelativeTime } from '@/utils/format';
import { Palette, Radius, Spacing } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { useCommentLikeStatus, useLikeComment, useUnlikeComment } from '@/hooks/queries/use-comment-likes';
import { useCommentReplies, useDeleteComment } from '@/hooks/queries/use-comments';

interface Props {
    episodeId: string;
    comment: Comment;
    onReply: (commentId: string, username: string) => void;
    isReply?: boolean;
    creatorId?: string;
}

export function CommentItem({ episodeId, comment, onReply, isReply = false, creatorId }: Props) {
    const theme = useTheme();
    const router = useRouter();
    const { user } = useAuthContext();
    const [showReplies, setShowReplies] = useState(false);

    const { data: likeStatus } = useCommentLikeStatus(comment._id, { enabled: !!user });
    const likeComment = useLikeComment();
    const unlikeComment = useUnlikeComment();
    const deleteComment = useDeleteComment(episodeId);

    // Queries for replies if expanded
    const {
        data: repliesData,
        isLoading: loadingReplies,
        fetchNextPage,
        hasNextPage,
    } = useCommentReplies(comment._id, { enabled: showReplies });

    const replies = repliesData?.pages.flatMap(p => p.data) || [];

    const handleLike = () => {
        if (!user) {
            router.push('/(auth)/login' as any);
            return;
        }
        if (likeStatus?.isLiked) {
            unlikeComment.mutate(comment._id);
        } else {
            likeComment.mutate(comment._id);
        }
    };

    const isAuthor = user?._id === comment.user?._id;
    const isCreator = creatorId === comment.user?._id;
    const currentLikes = likeStatus?.likesCount ?? comment.likesCount ?? 0;

    return (
        <View style={[s.container, isReply && s.replyContainer]}>
            <TouchableOpacity
                onPress={() => comment.user?._id && router.push(`/user/${comment.user._id}` as any)}
                style={[s.avatar, { backgroundColor: isCreator ? Palette.primary[500] : Palette.primary[50] }]}
            >
                <Text style={{ fontSize: 14, fontWeight: '700', color: isCreator ? '#FFF' : Palette.primary[500] }}>
                    {comment.user?.name?.[0]?.toUpperCase() || '?'}
                </Text>
            </TouchableOpacity>

            <View style={s.body}>
                <View style={s.header}>
                    <TouchableOpacity
                        onPress={() => comment.user?._id && router.push(`/user/${comment.user._id}` as any)}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                            {comment.user?.name || 'Anon'}
                        </Text>
                        {isCreator && (
                            <Surface style={s.creatorBadge} elevation={0}>
                                <Text style={s.creatorBadgeText}>Creator</Text>
                            </Surface>
                        )}
                    </TouchableOpacity>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatRelativeTime(comment.createdAt)}
                    </Text>
                </View>

                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2, lineHeight: 20 }}>
                    {comment.text}
                </Text>

                <View style={s.actionsBar}>
                    {/* Like */}
                    <TouchableOpacity style={s.actionBtn} onPress={handleLike}>
                        <Heart
                            size={14}
                            color={likeStatus?.isLiked ? theme.colors.error : theme.colors.onSurfaceVariant}
                            fill={likeStatus?.isLiked ? theme.colors.error : 'transparent'}
                        />
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 6 }}>
                            {currentLikes > 0 ? currentLikes : 'Like'}
                        </Text>
                    </TouchableOpacity>

                    {/* Reply */}
                    {!isReply && (
                        <TouchableOpacity
                            style={s.actionBtn}
                            onPress={() => onReply(comment._id, comment.user?.name || 'Anon')}
                        >
                            <MessageCircle size={14} color={theme.colors.onSurfaceVariant} />
                            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 6 }}>
                                Reply
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Delete */}
                    {isAuthor && (
                        <TouchableOpacity style={s.actionBtn} onPress={() => deleteComment.mutate(comment._id)}>
                            <Trash2 size={14} color={theme.colors.error} />
                            <Text variant="labelSmall" style={{ color: theme.colors.error, marginLeft: 4 }}>
                                Delete
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Replies Toggle */}
                {!isReply && (comment.replyCount && comment.replyCount > 0) ? (
                    <View style={s.repliesSection}>
                        <TouchableOpacity
                            style={s.toggleReplies}
                            onPress={() => setShowReplies(!showReplies)}
                        >
                            <View style={[s.replyLine, { backgroundColor: Palette.light.border }]} />
                            <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '600', marginRight: 4 }}>
                                {showReplies ? 'Hide replies' : `View ${comment.replyCount} replies`}
                            </Text>
                            {showReplies ? (
                                <ChevronUp size={14} color={theme.colors.primary} />
                            ) : (
                                <ChevronDown size={14} color={theme.colors.primary} />
                            )}
                        </TouchableOpacity>

                        {showReplies && (
                            <View style={s.repliesList}>
                                {loadingReplies && replies.length === 0 ? (
                                    <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 8 }} />
                                ) : (
                                    replies.map((reply) => (
                                        <CommentItem
                                            key={reply._id}
                                            episodeId={episodeId}
                                            comment={reply}
                                            onReply={onReply}
                                            isReply={true}
                                            creatorId={creatorId}
                                        />
                                    ))
                                )}
                                {hasNextPage && (
                                    <TouchableOpacity onPress={() => fetchNextPage()} style={s.loadMoreBtn}>
                                        <Text variant="labelSmall" style={{ color: theme.colors.primary }}>Load more replies...</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    replyContainer: {
        paddingHorizontal: 0,
        paddingVertical: Spacing.xs,
        marginTop: Spacing.xs,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    body: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
        gap: Spacing.lg,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    repliesSection: {
        marginTop: Spacing.sm,
    },
    toggleReplies: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    replyLine: {
        width: 24,
        height: 1,
        marginRight: Spacing.sm,
    },
    repliesList: {
        marginTop: Spacing.xs,
    },
    loadMoreBtn: {
        marginTop: Spacing.xs,
        paddingVertical: Spacing.xs,
    },
    creatorBadge: {
        backgroundColor: Palette.primary[500],
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
        marginLeft: 6,
    },
    creatorBadgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
});
