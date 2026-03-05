import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Image } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Mic } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CreatorChipProps {
  creator: {
    _id: string;
    name: string;
    showName?: string;
    avatar?: string;
  };
  style?: StyleProp<ViewStyle>;
}

export function CreatorChip({ creator, style }: CreatorChipProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/creator/${creator._id}` as any)}
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
            styles.avatar,
            {
              backgroundColor: isDark
                ? Palette.dark.elevated
                : Palette.primary[100],
            },
          ]}
        >
          {creator.avatar ? (
            <Image
              source={{ uri: creator.avatar }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          ) : (
            <Mic
              size={18}
              color={isDark ? Palette.primary[300] : Palette.primary[500]}
            />
          )}
        </View>
        <View style={styles.info}>
          <Text
            variant="titleSmall"
            numberOfLines={1}
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {creator.name}
          </Text>
          {creator.showName && (
            <Text
              variant="bodySmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {creator.showName}
            </Text>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
  },
});
