import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, Button, useTheme } from 'react-native-paper';
import { LogIn, UserPlus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const GuestBanner: React.FC = () => {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? Palette.dark.surfaceVariant
            : Palette.primary[50],
        },
      ]}
      elevation={1}
    >
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
            Join the Rawy Community
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            Sign in to follow creator, like episodes, and sync your library.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => router.push('/login')}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            icon={() => <LogIn size={16} color="#FFF" />}
          >
            Sign In
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push('/register')}
            style={[styles.button, { borderColor: theme.colors.primary }]}
            labelStyle={[styles.buttonLabel, { color: theme.colors.primary }]}
            icon={() => <UserPlus size={16} color={theme.colors.primary} />}
          >
            Join Free
          </Button>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  textSection: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: Radius.md,
  },
  buttonLabel: {
    fontSize: 13,
    marginVertical: 2,
    marginHorizontal: 4,
  },
});
