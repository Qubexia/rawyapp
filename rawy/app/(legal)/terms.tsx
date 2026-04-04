/**
 * Terms & Conditions screen — scrollable legal text.
 */

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { TERMS_AND_CONDITIONS } from '@/constants/terms';
import { Spacing } from '@/constants/theme';

export default function TermsScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Parse markdown-style content: split by ## for sections
  const sections = TERMS_AND_CONDITIONS.split(/\n## /);
  const elements: React.ReactNode[] = [];
  let key = 0;

  sections.forEach((section, i) => {
    const lines = section.trim().split('\n').filter((l) => l.trim());
    if (lines.length === 0) return;

    const firstLine = lines[0];
    // First section: main title (# Terms & Conditions) and optional subtitle
    if (i === 0 && firstLine.startsWith('# ')) {
      elements.push(
        <Text
          key={key++}
          variant="headlineMedium"
          style={[styles.mainTitle, { color: theme.colors.onBackground }]}
        >
          {firstLine.slice(2)}
        </Text>,
      );
      lines.shift();
    }
    // Subsequent sections: first line is section title (## was stripped by split)
    else if (i > 0) {
      elements.push(
        <Text
          key={key++}
          variant="titleLarge"
          style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
        >
          {firstLine}
        </Text>,
      );
      lines.shift();
    }

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith('## ')) {
        elements.push(
          <Text
            key={key++}
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            {trimmed.slice(3)}
          </Text>,
        );
        return;
      }
      if (trimmed.startsWith('- ')) {
        elements.push(
          <Text
            key={key++}
            variant="bodyMedium"
            style={[styles.listItem, { color: theme.colors.onSurface }]}
          >
            • {trimmed.slice(2)}
          </Text>,
        );
        return;
      }
      elements.push(
        <Text
          key={key++}
          variant="bodyMedium"
          style={[styles.body, { color: theme.colors.onSurface }]}
        >
          {trimmed.replace(/\*\*([^*]+)\*\*/g, '$1')}
        </Text>,
      );
    });
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {elements}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  mainTitle: {
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    marginBottom: Spacing.md,
  },
  body: {
    lineHeight: 24,
  },
  listItem: {
    marginLeft: Spacing.md,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
});
