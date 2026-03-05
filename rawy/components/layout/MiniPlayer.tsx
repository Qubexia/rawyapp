import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { Text, Surface, IconButton, useTheme, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Play, Pause } from 'lucide-react-native';
import { usePlayer } from '@/context/player-context';
import { SERVER_URL } from '@/services/axios-client';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MiniPlayer() {
  const { currentEpisode, isPlaying, togglePlay, position, duration } = usePlayer();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  if (!currentEpisode) return null;

  const handlePress = () => {
    router.push(`/episode/${currentEpisode._id}` as any);
  };

  const coverUrl = currentEpisode.podcast.coverImageUrl 
    ? { uri: `${SERVER_URL}/${currentEpisode.podcast.coverImageUrl.replace(/\\/g, '/')}` } 
    : null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <Surface 
      style={[
        s.container, 
        { 
          backgroundColor: isDark ? Palette.dark.surfaceVariant : '#FFF',
          borderTopColor: isDark ? Palette.dark.border : Palette.light.border 
        }
      ]} 
      elevation={4}
    >
      <ProgressBar progress={progress} color={theme.colors.primary} style={s.progressBar} />
      
      <TouchableOpacity onPress={handlePress} style={s.content} activeOpacity={0.9}>
        <View style={s.coverWrapper}>
          {coverUrl ? (
            <Image source={coverUrl} style={s.cover} />
          ) : (
            <View style={[s.cover, { backgroundColor: theme.colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }]}>
              <Play size={16} color={theme.colors.primary} />
            </View>
          )}
        </View>
        
        <View style={s.info}>
          <Text variant="labelLarge" numberOfLines={1} style={{ fontWeight: '700' }}>
            {currentEpisode.title}
          </Text>
          <Text variant="labelSmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {currentEpisode.podcast.title}
          </Text>
        </View>

        <IconButton 
          icon={() => isPlaying ? <Pause size={24} color={theme.colors.primary} fill={theme.colors.primary} /> : <Play size={24} color={theme.colors.primary} fill={theme.colors.primary} />} 
          onPress={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        />
      </TouchableOpacity>
    </Surface>
  );
}

const s = StyleSheet.create({
  container: {
    height: 64,
    width: '100%',
    borderTopWidth: 0.5,
  },
  progressBar: {
    height: 2,
    width: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  coverWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
});
