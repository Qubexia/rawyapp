/**
 * Episode detail screen — info, description, comments.
 * Player controls live in the separate /player screen.
 */

import React, { useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Share, RefreshControl, Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, IconButton, useTheme, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  ArrowLeft, Heart, MessageCircle, Play, Pause,
  Clock, Send, Share2, Music2, X, Eye
} from 'lucide-react-native';

import { useEpisode, useEpisodes } from '@/hooks/queries/use-episodes';
import { useLikeStatus, useToggleLike } from '@/hooks/queries/use-likes';
import { useComments, useCreateComment, useCreateReply } from '@/hooks/queries/use-comments';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import type { Comment } from '@/services/comments.service';
import { CommentItem } from '@/components/CommentItem';
import { resolveImageUrl } from '@/utils/url';
import { usePlayer } from '@/context/player-context';
import { generateEpisodeLink } from '@/utils/deep-link';
import { EpisodeRow, ErrorBoundary } from '@/components/ui';

// Space to reserve at the bottom
const MINI_PLAYER_CLEARANCE = 92; // 77px card + 15px gap

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const [commentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Animation state
  const playBtnScale = useSharedValue(1);
  const playBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  // Data queries
  const { data: episode, isLoading } = useEpisode(id);
  const { data: likeStatus } = useLikeStatus(id, { enabled: !!user });
  const toggleLike = useToggleLike(id);
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useComments(id);
  const { data: moreEpisodesData } = useEpisodes(episode?.podcast?._id);

  const createComment = useCreateComment(id);
  const createReply = useCreateReply(id, replyTo?.id ?? '');

  const { currentEpisode, isPlaying, playEpisode, togglePlay, trackView } = usePlayer();
  const isCurrentPlaying = currentEpisode?._id === id;

  // Record view on mount
  React.useEffect(() => {
    if (id) {
      trackView(id).catch(() => { });
    }
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchComments();
    setRefreshing(false);
  }, [refetchComments]);

  const handlePlayPress = async () => {
    if (!episode) return;
    if (isCurrentPlaying) {
      await togglePlay();
    } else {
      await playEpisode(episode);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = generateEpisodeLink(id);
      await Share.share({
        message: `Listen to "${episode?.title}" from "${episode?.podcast?.title}" on Rawy!\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch { }
  };

  const handleSend = async () => {
    const t = commentText.trim();
    if (!t) return;
    if (replyTo) {
      await createReply.mutateAsync(t);
      setReplyTo(null);
    } else {
      await createComment.mutateAsync(t);
    }
    setCommentText('');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const coverUri = resolveImageUrl(episode?.podcast?.coverImageUrl);
  const comments = commentsData?.pages.flatMap((p) => p.data) ?? [];
  const nextUp = (moreEpisodesData?.pages.flatMap(p => p.data) || []).filter(e => e._id !== id);

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      key={item._id}
      episodeId={id}
      comment={item}
      onReply={(commentId, name) => setReplyTo({ id: commentId, name })}
      creatorId={episode?.creator?._id}
    />
  );

  const ListHeader = () => (
    <View style={{ paddingBottom: Spacing.lg }}>
      {/* ── Top Section (Centered) ── */}
      <View style={s.centeredHeader}>
        <Surface style={[s.largeCover, { backgroundColor: Palette.primary[100] }]} elevation={4}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={s.coverImg} />
          ) : (
            <Music2 size={80} color={Palette.primary[500]} strokeWidth={1} />
          )}
        </Surface>

        <Text variant="headlineSmall" style={[s.largeTitle, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {episode?.title}
        </Text>

        <TouchableOpacity onPress={() => episode?.podcast?._id && router.push(`/podcast/${episode.podcast._id}` as any)}>
          <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            {episode?.podcast?.title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => episode?.creator?._id && router.push(`/creator/${episode.creator._id}` as any)}
          style={{ marginTop: 4 }}
        >
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            by {episode?.creator?.name}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Play Control ── */}
      <View style={s.playControlSection}>
        <Animated.View style={playBtnAnimStyle}>
          <TouchableOpacity
            style={[s.mainPlayBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handlePlayPress}
            onPressIn={() => (playBtnScale.value = withSpring(0.9))}
            onPressOut={() => (playBtnScale.value = withSpring(1))}
            activeOpacity={1}
          >
            {isCurrentPlaying && isPlaying ? (
              <Pause size={32} color="#FFF" fill="#FFF" />
            ) : (
              <Play size={32} color="#FFF" fill="#FFF" style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {episode?.duration ? (
          <Text variant="labelLarge" style={[s.durationText, { color: theme.colors.onSurfaceVariant }]}>
            {Math.floor(episode.duration / 60)}m {episode.duration % 60}s
          </Text>
        ) : null}
      </View>

      {/* ── Action bar ── */}
      <Surface style={[s.interactionBar, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <TouchableOpacity style={s.interactionItem} onPress={() => {
          if (!user) { router.push('/(auth)/login' as any); return; }
          toggleLike.mutate(likeStatus?.isLiked || false);
        }}>
          <Heart size={20} color={likeStatus?.isLiked ? '#EF4444' : theme.colors.onSurfaceVariant} fill={likeStatus?.isLiked ? '#EF4444' : 'transparent'} />
          <Text variant="labelSmall" style={s.interactionLabel}>
            {likeStatus?.likesCount ?? episode?.likesCount ?? 0}
          </Text>
        </TouchableOpacity>

        <View style={s.interactionItem}>
          <MessageCircle size={20} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={s.interactionLabel}>{episode?.commentsCount ?? comments.length}</Text>
        </View>

        <TouchableOpacity style={s.interactionItem} onPress={handleShare}>
          <Share2 size={20} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={s.interactionLabel}>Share</Text>
        </TouchableOpacity>

        <View style={s.interactionItem}>
          <Eye size={20} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={s.interactionLabel}>
            {episode?.viewsCount ?? 0}
          </Text>
        </View>
      </Surface>

      {/* ── Description ── */}
      {episode?.description && (
        <View style={s.descriptionSection}>
          <Text variant="titleMedium" style={s.sectionTitle}>About this episode</Text>
          <View>
            <Text
              variant="bodyMedium"
              style={[s.descriptionText, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={isDescExpanded ? undefined : 3}
            >
              {episode.description}
            </Text>
            {episode.description.length > 150 && (
              <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)} style={{ marginTop: 4 }}>
                <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                  {isDescExpanded ? 'Show less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Next Up ── */}
      {nextUp.length > 0 && (
        <View style={s.nextUpSection}>
          <Text variant="titleMedium" style={s.sectionTitle}>Next Up</Text>
          <FlatList
            horizontal
            data={nextUp.slice(0, 5)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={{ width: 280, marginRight: Spacing.md }}>
                <Surface style={{ borderRadius: Radius.md, overflow: 'hidden' }} elevation={1}>
                  <EpisodeRow episode={item} />
                </Surface>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.sm }}
          />
        </View>
      )}

      {/* ── Divider ── */}
      <View style={[s.divider, { backgroundColor: theme.colors.surfaceVariant }]} />

      {/* ── Comments Header ── */}
      <View style={s.commentsSectionHeader}>
        <Text variant="titleLarge" style={s.sectionTitle}>Comments</Text>
        {comments.length > 0 && (
          <Chip compact style={{ backgroundColor: theme.colors.surfaceVariant }}>
            {comments.length}
          </Chip>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <ErrorBoundary onReset={onRefresh}>
        <View style={s.topBar}>
          <IconButton
            icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
            onPress={() => router.back()}
          />
          <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>Episode</Text>
          <View style={{ width: 48 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1, marginBottom: currentEpisode ? MINI_PLAYER_CLEARANCE : 0 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            data={comments}
            keyExtractor={(i, idx) => i?._id ? String(i._id) : String(idx)}
            renderItem={renderComment}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={{ paddingBottom: Spacing.xxl }}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === 'android' ? true : false}
            maxToRenderPerBatch={8}
            windowSize={10}
            initialNumToRender={5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={() =>
              !commentsLoading ? (
                <View style={s.emptyC}>
                  <MessageCircle size={28} color={theme.colors.onSurfaceVariant} strokeWidth={1} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                    Be the first to comment!
                  </Text>
                </View>
              ) : null
            }
          />
          {user && (
            <Surface style={[s.inputBarContainer, { backgroundColor: '#FFF', borderTopColor: Palette.light.border }]} elevation={2}>
              {replyTo && (
                <View style={s.replyingToBar}>
                  <Text variant="labelSmall" style={{ color: theme.colors.primary, flex: 1 }}>
                    Replying to {replyTo.name}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyTo(null)}>
                    <X size={16} color={theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={s.inputBar}>
                <TextInput
                  style={[s.input, { color: theme.colors.onSurface }]}
                  placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <IconButton
                  icon={() =>
                    (createComment.isPending || createReply.isPending)
                      ? <ActivityIndicator size={20} color={theme.colors.primary} />
                      : <Send size={20} color={commentText.trim() ? theme.colors.primary : theme.colors.onSurfaceVariant} />
                  }
                  onPress={handleSend}
                  disabled={!commentText.trim() || createComment.isPending || createReply.isPending}
                />
              </View>
            </Surface>
          )}
        </KeyboardAvoidingView>
      </ErrorBoundary>
    </SafeAreaView >
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs, height: 56 },

  centeredHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  largeCover: {
    width: 200,
    height: 200,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  largeTitle: {
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 4,
  },

  playControlSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  mainPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  durationText: {
    marginTop: Spacing.sm,
    fontWeight: '600',
  },

  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.xl,
  },
  interactionItem: {
    alignItems: 'center',
    flex: 1,
  },
  interactionLabel: {
    color: 'rgba(0,0,0,0.5)',
    marginTop: 4,
    fontWeight: '600',
  },

  descriptionSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  nextUpSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: '900',
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    lineHeight: 22,
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  commentsSectionHeader: {
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  // Input
  inputBarContainer: {
    borderTopWidth: 0.5,
  },
  replyingToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    backgroundColor: Palette.primary[50],
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  input: { flex: 1, fontSize: 15, maxHeight: 80, paddingVertical: Spacing.sm },
  emptyC: { alignItems: 'center', paddingVertical: Spacing.xl },
});
