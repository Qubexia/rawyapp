import React, { useState } from 'react';
import { View, StyleSheet, Image, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Headphones } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Palette, Spacing, Radius } from '@/constants/theme';
import { Interactive } from './Interactive';
import type { Podcast } from '@/services/podcasts.service';

import { resolveImageUrl } from '@/utils/url';

interface PodcastCardProps {
  podcast: Podcast;
  style?: StyleProp<ViewStyle>;
  width?: number;
}

export function PodcastCard({ podcast, style, }: PodcastCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const coverUri = resolveImageUrl(podcast.coverImageUrl);
  const [imgError, setImgError] = useState(false);
  const { width } = Dimensions.get('window');
  const cardWidth = width * 0.8;
  return (
    <Interactive
      onPress={() => router.push(`/podcast/${podcast._id}` as any)}
      style={[{ width: cardWidth }, style]}
    >
      <Surface
        style={[
          styles.inner,
          {
            backgroundColor: Palette.light.surfaceVariant,
          },
        ]}
        elevation={1}
      >
        <View
          style={[
            styles.cover,
            { height: cardWidth * 0.9 },
            { backgroundColor: Palette.primary[100] },
          ]}
        >
          {coverUri && !imgError ? (
            <Image
              source={{ uri: coverUri }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <Headphones
              size={32}
              color={Palette.primary[500]}
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
    </Interactive>
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
