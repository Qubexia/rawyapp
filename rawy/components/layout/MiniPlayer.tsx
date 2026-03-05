import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Play, Pause, X, Music2 } from 'lucide-react-native';
import { usePlayer } from '@/context/player-context';
import { resolveImageUrl } from '@/utils/url';
import { Spacing, Radius } from '@/constants/theme';

export default function MiniPlayer() {
  const { currentEpisode, isPlaying, togglePlay, position, duration, dismiss } = usePlayer();
  const theme = useTheme();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  if (!currentEpisode) return null;

  const coverUri = resolveImageUrl(currentEpisode.podcast.coverImageUrl);
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.97}
      onPress={() => router.push('/player' as any)}
      style={[s.card, { backgroundColor: '#FFFFFF', shadowColor: '#000' }]}
    >
      {/* Thin progress bar at very top of card */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.colors.primary }]} />
      </View>

      <View style={s.content}>
        {/* Cover art */}
        <View style={s.coverWrapper}>
          {coverUri && !imgError ? (
            <Image source={{ uri: coverUri }} style={s.cover} onError={() => setImgError(true)} />
          ) : (
            <View style={[s.cover, s.coverFallback, { backgroundColor: theme.colors.primaryContainer }]}>
              <Music2 size={20} color={theme.colors.primary} strokeWidth={1.5} />
            </View>
          )}
        </View>

        {/* Title & Podcast */}
        <View style={s.info}>
          <Text
            variant="labelLarge"
            numberOfLines={1}
            style={{ fontWeight: '700', color: '#111827', letterSpacing: 0.1 }}
          >
            {currentEpisode.title}
          </Text>
          <Text
            variant="labelSmall"
            numberOfLines={1}
            style={{ color: '#6B7280', marginTop: 2 }}
          >
            {currentEpisode.podcast.title}
          </Text>
        </View>

        {/* Play/Pause circle */}
        <TouchableOpacity
          style={[s.playBtn, { backgroundColor: theme.colors.primary }]}
          onPress={(e) => { e.stopPropagation(); togglePlay(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isPlaying
            ? <Pause size={17} color="#FFF" fill="#FFF" />
            : <Play size={17} color="#FFF" fill="#FFF" />}
        </TouchableOpacity>

        {/* Close */}
        <TouchableOpacity
          style={s.closeBtn}
          onPress={(e) => { e.stopPropagation(); dismiss(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  progressBg: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
  },
  content: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  coverWrapper: {
    width: 46,
    height: 46,
    borderRadius: Radius.md + 2,
    overflow: 'hidden',
    flexShrink: 0,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
