import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { useAudioPlayer } from 'expo-audio';
import { formatRecordingDuration } from '@/utils/audio-recording';
import { Palette, Radius, Spacing } from '@/constants/theme';

interface RecordingPreviewProps {
  uri: string;
  durationSeconds: number;
  onRetake: () => void;
}

export function RecordingPreview({ uri, durationSeconds, onRetake }: RecordingPreviewProps) {
  const theme = useTheme();
  const player = useAudioPlayer(uri);

  // Stop playback when component unmounts
  useEffect(() => {
    return () => {
      try {
        if (player && player.playing) {
          player.pause();
        }
      } catch (e) {}
    };
  }, [player]);

  const togglePlayback = () => {
    if (!player) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={s.container}>
      <View style={[s.card, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={s.row}>
          <TouchableOpacity 
            style={[s.playButton, { backgroundColor: theme.colors.primary }]}
            onPress={togglePlayback}
          >
            {player?.playing ? (
               <Pause size={20} color={Palette.white.pure} />
            ) : (
               <Play size={20} color={Palette.white.pure} style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>
          
          <View style={s.info}>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              Recording Ready
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatRecordingDuration(durationSeconds)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={s.retakeButton}
          onPress={onRetake}
        >
          <RotateCcw size={16} color={theme.colors.error} style={{ marginRight: 6 }} />
          <Text style={{ color: theme.colors.error, fontWeight: '600' }}>Retake Recording</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: Radius.md,
  },
});
