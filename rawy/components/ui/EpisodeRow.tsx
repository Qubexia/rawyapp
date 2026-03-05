import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Image } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Play, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Episode } from '@/services/episodes.service';

interface EpisodeRowProps {
  episode: Episode;
  style?: StyleProp<ViewStyle>;
  showPodcastName?: boolean;
  rightAction?: React.ReactNode;
}

export function EpisodeRow({ episode, style, showPodcastName = true, rightAction }: EpisodeRowProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/episode/${episode._id}` as any)}
      style={style}
    >
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: isDark
              ? Palette.dark.surfaceVariant
              : Palette.light.surface,
          },
        ]}
        elevation={1}
      >
        <View
          style={[
            styles.thumb,
            { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[50], overflow: 'hidden' },
          ]}
        >
          {episode.podcast?.coverImageUrl ? (
            <Image
              source={{ uri: episode.podcast.coverImageUrl }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          ) : (
            <Play
              size={20}
              color={isDark ? Palette.primary[300] : Palette.primary[500]}
              fill={isDark ? Palette.primary[300] : Palette.primary[500]}
            />
          )}
        </View>
        <View style={styles.info}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {episode.title}
          </Text>
          {showPodcastName && (
            <Text
              variant="bodySmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {episode.podcast?.title || 'Podcast'}
            </Text>
          )}
          <View style={styles.meta}>
            <Clock size={12} color={theme.colors.onSurfaceVariant} />
            <Text
              variant="labelSmall"
              style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}
            >
              {episode.duration
                ? `${Math.floor(episode.duration / 60)} min`
                : 'Unknown'}
            </Text>
          </View>
        </View>
        {rightAction && (
          <View style={styles.rightAction}>
            {rightAction}
          </View>
        )}
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    marginLeft: 4,
  },
  rightAction: {
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
});
