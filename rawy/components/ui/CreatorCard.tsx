import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Mic, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { resolveImageUrl } from '@/utils/url';

interface CreatorCardProps {
  creator: {
    _id: string;
    name: string;
    showName?: string;
    avatarUrl?: string;
    followerCount?: number;
    podcastCount?: number;
  };
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const avatarUri = resolveImageUrl(creator.avatarUrl);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/creator/${creator._id}` as any)}
    >
      <Surface style={[styles.card, { backgroundColor: Palette.light.surface }]} elevation={1}>
        <View style={[styles.avatar, { backgroundColor: Palette.primary[100] }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Mic size={24} color={Palette.primary[500]} />
          )}
        </View>
        <Text
          variant="titleSmall"
          numberOfLines={1}
          style={[styles.name, { color: theme.colors.onSurface }]}
        >
          {creator.name}
        </Text>
        {creator.showName ? (
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
          >
            {creator.showName}
          </Text>
        ) : null}
        {creator.followerCount !== undefined ? (
          <View style={styles.stats}>
            <Users size={12} color={theme.colors.onSurfaceVariant} />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {creator.followerCount.toLocaleString()}
            </Text>
          </View>
        ) : null}
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: 4,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontWeight: '600',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});
