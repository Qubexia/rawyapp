/**
 * Episode detail screen — player, comments, likes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Share, RefreshControl, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, MessageCircle, Play, Pause, Clock, Send, Trash2, Share2 } from 'lucide-react-native';

// Lazy import to avoid crash when expo-audio native module is missing (Expo Go)
let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-audio');
} catch (e) {
  console.log('[EpisodeDetail] Note: Audio playback will require a development build.');
}


import { useEpisode } from '@/hooks/queries/use-episodes';
import { useLikeStatus, useToggleLike } from '@/hooks/queries/use-likes';
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/queries/use-comments';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Comment } from '@/services/comments.service';
import { formatRelativeTime } from '@/utils/format';

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { user } = useAuthContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [commentText, setCommentText] = useState('');

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { data: episode, isLoading } = useEpisode(id);
  const { data: likeStatus } = useLikeStatus(id, { enabled: !!user });
  const toggleLike = useToggleLike(id);
  const { data: commentsData, isLoading: commentsLoading, refetch: refetchComments } = useComments(id);
  const createComment = useCreateComment(id);
  const deleteComment = useDeleteComment(id);
  const comments = commentsData?.pages.flatMap((p) => p.data) ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchComments();
    setRefreshing(false);
  }, [refetchComments]);

  // --- Audio Player Logic (expo-audio) ---
  const player = ExpoAudio?.useAudioPlayer(episode?.audioFileUrl || '');
  
  // Use useEffect to handle status updates manually if needed, 
  // or use shared values for progress.
  useEffect(() => {
    if (!player) return;
    
    setIsPlaying(player.playing);
    setDuration(player.duration || 0);
    
    // expo-audio uses numbers in seconds, we need to convert to millis for our formatter
    // or update the formatter. Let's keep it in seconds internally.
    const interval = setInterval(() => {
      setPosition(player.currentTime * 1000);
      setDuration(player.duration * 1000);
      setIsPlaying(player.playing);
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  const togglePlayPause = async () => {
    if (!ExpoAudio || !player) {
      Alert.alert('Audio Unavailable', 'Audio playback requires a development build.');
      return;
    }

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTimeMillis = (millis: number) => {
    if (isNaN(millis) || millis < 0) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listen to "${episode?.title}" from "${episode?.podcast?.title}" on Rawy!`,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const handleSend = async () => {
    const t = commentText.trim();
    if (!t) return;
    await createComment.mutateAsync(t);
    setCommentText('');
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={s.commentRow}>
      <View style={[s.commentAvatar, { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[50] }]}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? Palette.primary[300] : Palette.primary[500] }}>
          {item.user?.name?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={s.commentBody}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>{item.user?.name || 'Anon'}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>{item.text}</Text>
      </View>
      {user?._id === item.user?._id && (
        <IconButton icon={() => <Trash2 size={16} color={theme.colors.error} />} size={20} onPress={() => deleteComment.mutate(item._id)} />
      )}
    </View>
  );

  const Header = () => (
    <>
      <Surface style={[s.player, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surfaceVariant }]} elevation={1}>
        <View style={[s.cover, { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[100], overflow: 'hidden' }]}>
          {episode?.podcast?.coverImageUrl ? (
            <Image source={{ uri: episode.podcast.coverImageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          ) : (
            <Play size={48} color={isDark ? Palette.primary[300] : Palette.primary[500]} fill={isDark ? Palette.primary[300] : Palette.primary[500]} />
          )}
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: '800', textAlign: 'center', color: theme.colors.onSurface, marginBottom: 4 }} numberOfLines={3}>{episode?.title}</Text>
        <TouchableOpacity onPress={() => episode?.podcast?._id && router.push(`/podcast/${episode.podcast._id}` as any)}>
          <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '600', textAlign: 'center' }}>{episode?.podcast?.title || 'Podcast'}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md }}>
          <Clock size={14} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 6 }}>
            {episode?.duration ? `${Math.floor(episode.duration / 60)}m ${episode.duration % 60}s` : '—'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ width: '100%', paddingHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
          <View style={{ height: 4, backgroundColor: isDark ? Palette.dark.border : Palette.light.border, borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: theme.colors.primary, width: duration > 0 ? `${(position / duration) * 100}%` : '0%' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{formatTimeMillis(position)}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{formatTimeMillis(duration || (episode?.duration ? episode.duration * 1000 : 0))}</Text>
          </View>
        </View>

        <TouchableOpacity style={[s.playBtn, { backgroundColor: theme.colors.primary }]} onPress={togglePlayPause}>
          {isPlaying ? <Pause size={28} color="#FFF" fill="#FFF" /> : <Play size={28} color="#FFF" fill="#FFF" />}
        </TouchableOpacity>
        <View style={s.actions}>
          <TouchableOpacity 
            style={s.action} 
            onPress={() => {
              if (!user) {
                router.push('/(auth)/login' as any);
                return;
              }
              toggleLike.mutate(likeStatus?.isLiked || false);
            }}
          >
            <Heart size={22} color={likeStatus?.isLiked ? '#EF4444' : theme.colors.onSurfaceVariant} fill={likeStatus?.isLiked ? '#EF4444' : 'transparent'} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {likeStatus?.likesCount ?? episode?.likesCount ?? 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.action}>
            <MessageCircle size={22} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{comments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.action} onPress={handleShare}>
            <Share2 size={22} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>Share</Text>
          </TouchableOpacity>
        </View>
      </Surface>
      {episode?.description && (
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg }}>
          <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700', marginBottom: 8 }}>Description</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 22 }}>{episode.description}</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md }}>
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Comments</Text>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{comments.length}</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '600' }}>Now Playing</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList 
          data={comments} 
          keyExtractor={(i, index) => i?._id ? String(i._id) : String(index)} 
          renderItem={renderComment} 
          ListHeaderComponent={Header} 
          contentContainerStyle={{ paddingBottom: Spacing.xxl }} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          ListEmptyComponent={() => !commentsLoading ? <View style={s.emptyC}><MessageCircle size={28} color={theme.colors.onSurfaceVariant} strokeWidth={1} /><Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>Be the first to comment!</Text></View> : null} 
        />
        {user && (
          <Surface style={[s.inputBar, { backgroundColor: isDark ? Palette.dark.surface : '#FFF', borderTopColor: isDark ? Palette.dark.border : Palette.light.border }]} elevation={2}>
            <TextInput style={[s.input, { color: theme.colors.onSurface }]} placeholder="Write a comment..." placeholderTextColor={theme.colors.onSurfaceVariant} value={commentText} onChangeText={setCommentText} multiline />
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
  player: { marginHorizontal: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.lg },
  cover: { width: 160, height: 160, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  playBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.lg },
  actions: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: Spacing.lg },
  action: { alignItems: 'center', paddingHorizontal: Spacing.lg },
  commentRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignItems: 'flex-start' },
  commentAvatar: { width: 32, height: 32, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  commentBody: { flex: 1 },
  emptyC: { alignItems: 'center', paddingVertical: Spacing.xl },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderTopWidth: 0.5 },
  input: { flex: 1, fontSize: 15, maxHeight: 80, paddingVertical: Spacing.sm },
});
