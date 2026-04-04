import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatRecordingDuration, MAX_RECORDING_DURATION_SEC } from '@/utils/audio-recording';

interface RecordingTimerProps {
  durationSeconds: number;
  isRecording?: boolean;
}

export function RecordingTimer({ durationSeconds, isRecording = false }: RecordingTimerProps) {
  const theme = useTheme();

  // Pulse effect when recording, static when paused/stopped
  const [opacity, setOpacity] = React.useState(1);

  React.useEffect(() => {
    if (!isRecording) {
      setOpacity(1);
      return;
    }

    const interval = setInterval(() => {
      setOpacity((prev) => (prev === 1 ? 0.4 : 1));
    }, 800);

    return () => clearInterval(interval);
  }, [isRecording]);

  const percentage = Math.min((durationSeconds / MAX_RECORDING_DURATION_SEC) * 100, 100);
  const isNearLimit = durationSeconds > MAX_RECORDING_DURATION_SEC - 900; // Last 15 minutes warning

  return (
    <View style={s.container}>
      <Text
        style={[
          s.time,
          { color: theme.colors.onBackground, opacity },
          isNearLimit && { color: theme.colors.error }
        ]}
      >
        {formatRecordingDuration(durationSeconds)}
      </Text>
      
      <View style={[s.visualizer, { borderColor: theme.colors.outline }]}>
        <View 
          style={[
            s.progress, 
            { 
              backgroundColor: isNearLimit ? theme.colors.error : theme.colors.primary,
              width: `${percentage}%` 
            }
          ]} 
        />
      </View>
      
      <View style={s.limitRow}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          0:00
        </Text>
        {isNearLimit && (
          <Text variant="labelSmall" style={{ color: theme.colors.error, fontWeight: 'bold' }}>
            Approaching Limit
          </Text>
        )}
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {formatRecordingDuration(MAX_RECORDING_DURATION_SEC)}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  time: {
    fontSize: 56,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginBottom: 24,
  },
  visualizer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
});
