/**
 * Privacy Policy — placeholder screen.
 */

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[s.scroll, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={s.content}
    >
      <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
        Privacy Policy
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginTop: Spacing.md }}>
        Our privacy policy is currently being updated. Please check back soon.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
});
