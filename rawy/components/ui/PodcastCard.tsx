import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Image } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Headphones } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Podcast } from '@/services/podcasts.service';

interface PodcastCardProps {
  podcast: Podcast;
  style?: StyleProp<ViewStyle>;
  width?: number;
}

export function PodcastCard({ podcast, style, width = 160 }: PodcastCardProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/podcast/${podcast._id}` as any)}
      style={[{ width }, style]}
    >
      <Surface
        style={[
          styles.inner,
          {
            backgroundColor: isDark
              ? Palette.dark.surfaceVariant
              : Palette.light.surfaceVariant,
          },
        ]}
        elevation={1}
      >
        <View
          style={[
            styles.cover,
            { height: width - 32 },
            { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[100] },
          ]}
        >
          {podcast.coverImageUrl ? (
            <Image
              source={{ uri: podcast.coverImageUrl }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          ) : (
            <Headphones
              size={32}
              color={isDark ? Palette.primary[300] : Palette.primary[500]}
              strokeWidth={1.5}
            />
          )}
        </View>
        <Text
          variant="titleSmall"
          numberOfLines={2}
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {podcast.title}
        </Text>
        <Text
          variant="bodySmall"
          numberOfLines={1}
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {podcast.creator?.name || 'Unknown'}
        </Text>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  inner: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  cover: {
    width: '100%',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
});
