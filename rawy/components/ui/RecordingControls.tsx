/**
 * RecordingControls — Start/Pause/Resume/Stop buttons for in-app recording.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Mic, Pause, Play, Square } from 'lucide-react-native';
import { Palette, Spacing, Radius } from '@/constants/theme';
import type { RecordingStatus } from '@/utils/audio-recording';

interface RecordingControlsProps {
  status: RecordingStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function RecordingControls({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  disabled = false,
}: RecordingControlsProps) {
  const theme = useTheme();

  if (status === 'idle' || status === 'stopped') {
    return (
      <View style={s.container}>
        <TouchableOpacity
          onPress={onStart}
          disabled={disabled}
          activeOpacity={0.7}
          style={[s.mainButton, { backgroundColor: '#EF4444', opacity: disabled ? 0.5 : 1 }]}
        >
          <Mic size={32} color={Palette.white.pure} />
        </TouchableOpacity>
        <Text
          variant="labelMedium"
          style={[s.label, { color: theme.colors.onSurfaceVariant }]}
        >
          Tap to Record
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.controlsRow}>
        {/* Pause / Resume */}
        <TouchableOpacity
          onPress={status === 'recording' ? onPause : onResume}
          activeOpacity={0.7}
          style={[s.secondaryButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          {status === 'recording' ? (
            <Pause size={24} color={theme.colors.onSurface} />
          ) : (
            <Play size={24} color={theme.colors.onSurface} />
          )}
        </TouchableOpacity>

        {/* Recording indicator */}
        <View style={[s.mainButton, { backgroundColor: '#EF4444' }]}>
          <View style={s.recordingDot} />
        </View>

        {/* Stop */}
        <TouchableOpacity
          onPress={onStop}
          activeOpacity={0.7}
          style={[s.secondaryButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Square size={22} color={theme.colors.onSurface} fill={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      <Text
        variant="labelMedium"
        style={[s.label, { color: theme.colors.onSurfaceVariant }]}
      >
        {status === 'recording' ? 'Recording...' : 'Paused'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Palette.white.pure,
  },
  label: {
    marginTop: Spacing.md,
    fontWeight: '600',
  },
});
