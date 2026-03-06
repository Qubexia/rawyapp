/**
 * Episode detail screen — info, description, comments.
 * Player controls live in the separate /player screen.
 */

import React, { useState, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Share, RefreshControl, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, Play, Pause, Clock, Send, Trash2, Share2, Music2 } from 'lucide-react-native';

import { useEpisode } from '@/hooks/queries/use-episodes';
import { useLikeStatus, useToggleLike } from '@/hooks/queries/use-likes';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/queries/use-comments';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import type { Comment } from '@/services/comments.service';
import { formatRelativeTime } from '@/utils/format';
import { resolveImageUrl } from '@/utils/url';

import { usePlayer } from '@/context/player-context';

// Space to reserve at the bottom when the mini-player is visible
const MINI_PLAYER_CLEARANCE = 92; // 77px card + 15px gap

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();
  const [commentText, setCommentText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: episode, isLoading } = useEpisode(id);
  const { data: likeStatus } = useLikeStatus(id, { enabled: !!user });
  const toggleLike = useToggleLike(id);
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useComments(id);
  const createComment = useCreateComment(id);
  const deleteComment = useDeleteComment(id);
  const comments = commentsData?.pages.flatMap((p) => p.data) ?? [];

  const { currentEpisode, isPlaying, playEpisode, togglePlay } = usePlayer();
  const isCurrentPlaying = currentEpisode?._id === id;

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
    router.push('/player' as any);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listen to "${episode?.title}" from "${episode?.podcast?.title}" on Rawy!`,
      });
    } catch {}
  };

  const handleSend = async () => {
    const t = commentText.trim();
    if (!t) return;
    await createComment.mutateAsync(t);
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

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={s.commentRow}>
      <TouchableOpacity
        onPress={() => item.user?._id && router.push(`/user/${item.user._id}` as any)}
        style={[s.commentAvatar, { backgroundColor: Palette.primary[50] }]}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: Palette.primary[500] }}>
          {item.user?.name?.[0]?.toUpperCase() || '?'}
        </Text>
      </TouchableOpacity>
      <View style={s.commentBody}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => item.user?._id && router.push(`/user/${item.user._id}` as any)}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>{item.user?.name || 'Anon'}</Text>
          </TouchableOpacity>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>{item.text}</Text>
      </View>
      {user?._id === item.user?._id && (
        <IconButton icon={() => <Trash2 size={16} color={theme.colors.error} />} size={20} onPress={() => deleteComment.mutate(item._id)} />
      )}
    </View>
  );

  const ListHeader = () => (
    <>
      {/* ── Hero card ── */}
      <View style={s.hero}>
        {/* Cover */}
        <TouchableOpacity style={[s.coverBox, s.coverBoxLight]} onPress={handlePlayPress} activeOpacity={0.9}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={s.coverImg} />
          ) : (
            <Music2 size={56} color={Palette.primary[500]} strokeWidth={1.5} />
          )}
          {/* Play overlay */}
          <View style={s.playOverlay}>
            <View style={[s.playCircle, { backgroundColor: theme.colors.primary }]}>
              {isCurrentPlaying && isPlaying
                ? <Pause size={28} color="#FFF" fill="#FFF" />
                : <Play size={28} color="#FFF" fill="#FFF" />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Title & meta */}
        <View style={s.heroMeta}>
          <Text variant="headlineSmall" style={[s.episodeTitle, { color: theme.colors.onSurface }]} numberOfLines={3}>
            {episode?.title}
          </Text>
          <TouchableOpacity onPress={() => episode?.podcast?._id && router.push(`/podcast/${episode.podcast._id}` as any)}>
            <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '600', marginTop: 4 }}>
              {episode?.podcast?.title}
            </Text>
          </TouchableOpacity>
          {episode?.duration ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Clock size={13} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 5 }}>
                {Math.floor(episode.duration / 60)}m {episode.duration % 60}s
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Action bar ── */}
      <Surface style={[s.actionBar, { backgroundColor: '#FFF' }]} elevation={1}>
        {/* Like */}
        <TouchableOpacity style={s.actionItem} onPress={() => {
          if (!user) { router.push('/(auth)/login' as any); return; }
          toggleLike.mutate(likeStatus?.isLiked || false);
        }}>
          <Heart size={22} color={likeStatus?.isLiked ? '#EF4444' : theme.colors.onSurfaceVariant} fill={likeStatus?.isLiked ? '#EF4444' : 'transparent'} />
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {likeStatus?.likesCount ?? episode?.likesCount ?? 0}
          </Text>
        </TouchableOpacity>

        {/* Comments count */}
        <View style={s.actionItem}>
          <MessageCircle size={22} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{comments.length}</Text>
        </View>

        {/* Share */}
        <TouchableOpacity style={s.actionItem} onPress={handleShare}>
          <Share2 size={22} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>Share</Text>
        </TouchableOpacity>

        {/* Open Player */}
        {isCurrentPlaying && (
          <TouchableOpacity style={s.actionItem} onPress={() => router.push('/player' as any)}>
            <Play size={22} color={theme.colors.primary} />
            <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: 4, fontWeight: '700' }}>Player</Text>
          </TouchableOpacity>
        )}
      </Surface>

      {/* ── Description ── */}
      {episode?.description && (
        <View style={s.section}>
          <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700', marginBottom: 8 }}>Description</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>{episode.description}</Text>
        </View>
      )}

      {/* ── Comments header ── */}
      <View style={s.commentsHeader}>
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Comments</Text>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{comments.length}</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
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
          <Surface style={[s.inputBar, { backgroundColor: '#FFF', borderTopColor: Palette.light.border }]} elevation={2}>
            <TextInput
              style={[s.input, { color: theme.colors.onSurface }]}
              placeholder="Write a comment..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <IconButton
              icon={() =>
                createComment.isPending
                  ? <ActivityIndicator size={20} color={theme.colors.primary} />
                  : <Send size={20} color={commentText.trim() ? theme.colors.primary : theme.colors.onSurfaceVariant} />
              }
              onPress={handleSend}
              disabled={!commentText.trim() || createComment.isPending}
            />
          </Surface>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs },

  // Hero section
  hero: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  coverBox: {
    width: 120,
    height: 120,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  coverBoxLight: { backgroundColor: Palette.primary[100] },
  coverBoxDark: { backgroundColor: Palette.dark.elevated },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  heroMeta: { flex: 1 },
  episodeTitle: { fontWeight: '800', lineHeight: 28 },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
  },
  actionItem: { alignItems: 'center', paddingHorizontal: Spacing.lg },

  // Sections
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },

  // Comments
  commentRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignItems: 'flex-start' },
  commentAvatar: { width: 32, height: 32, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  commentBody: { flex: 1 },
  emptyC: { alignItems: 'center', paddingVertical: Spacing.xl },

  // Input
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderTopWidth: 0.5 },
  input: { flex: 1, fontSize: 15, maxHeight: 80, paddingVertical: Spacing.sm },
});


// Lazy import to avoid crash when expo-audio native module is missing (Expo Go)

