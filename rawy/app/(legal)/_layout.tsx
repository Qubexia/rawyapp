/**
 * Legal route group layout — Terms, Privacy, etc.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LegalLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
          onPress={() => router.back()}
          size={24}
        />
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Legal
        </Text>
        <View style={{ width: 48 }} />
      </View>
      <View style={styles.stackContainer}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  title: { fontWeight: '700' },
  stackContainer: { flex: 1 },
});
