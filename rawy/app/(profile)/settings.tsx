/**
 * Settings screen — stub for app preferences.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, IconButton, useTheme, Divider, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Shield, CircleHelp } from 'lucide-react-native';

import { Palette, Spacing, Radius } from '@/constants/theme';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Settings</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
        <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700', marginBottom: Spacing.md }}>Preferences</Text>
        <Surface style={[s.card, { backgroundColor: Palette.light.surface }]} elevation={1}>
          <View style={s.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Bell size={20} color={theme.colors.onSurface} strokeWidth={1.5} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginLeft: Spacing.md }}>Push Notifications</Text>
            </View>
            <Switch value={true} onValueChange={() => {}} color={theme.colors.primary} />
          </View>
        </Surface>

        <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700', marginTop: Spacing.xl, marginBottom: Spacing.md }}>About</Text>
        <Surface style={[s.card, { backgroundColor: Palette.light.surface }]} elevation={1}>
          <View style={s.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Shield size={20} color={theme.colors.onSurface} strokeWidth={1.5} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginLeft: Spacing.md }}>Privacy Policy</Text>
            </View>
          </View>
          <Divider style={{ marginHorizontal: Spacing.md }} />
          <View style={s.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CircleHelp size={20} color={theme.colors.onSurface} strokeWidth={1.5} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginLeft: Spacing.md }}>Help & Support</Text>
            </View>
          </View>
        </Surface>

        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.xxl }}>Rawy v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs },
  card: { borderRadius: Radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
});
