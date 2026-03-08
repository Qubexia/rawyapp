/**
 * Settings screen — notifications, account, legal, support.
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  Divider,
  Switch,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  ArrowLeft,
  Bell,
  Shield,
  CircleHelp,
  Lock,
  Trash2,
  FileText,
  ChevronRight,
} from 'lucide-react-native';

import { Palette, Spacing, Radius } from '@/constants/theme';
import { STORAGE_KEYS } from '@/utils/constants';
import { useAuthContext } from '@/context/auth-context';
import { updatePushPreference } from '@/services/users.service';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, updateUser } = useAuthContext();
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(user?.pushEnabled ?? true);

  useEffect(() => {
    if (user) {
      setPushEnabled(user.pushEnabled);
    }
  }, [user]);

  const onPushToggle = async (value: boolean) => {
    // Optimistic update
    setPushEnabled(value);
    try {
      await updatePushPreference(value);
      updateUser({ pushEnabled: value });
      await AsyncStorage.setItem(
        STORAGE_KEYS.PUSH_NOTIFICATIONS_ENABLED,
        String(value),
      );
    } catch (err) {
      // Revert on error
      setPushEnabled(!value);
      console.error('Failed to update push preference:', err);
    }
  };

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? '1.0.0';

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton
          icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
          onPress={() => router.back()}
          size={24}
        />
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onBackground, fontWeight: '700' }}
        >
          Settings
        </Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Notifications */}
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.primary,
            fontWeight: '700',
            marginBottom: Spacing.md,
          }}
        >
          Notifications
        </Text>
        <Surface
          style={[s.card, { backgroundColor: Palette.light.surface }]}
          elevation={1}
        >
          <View style={s.row}>
            <View style={s.rowLeft}>
              <Bell
                size={20}
                color={theme.colors.onSurface}
                strokeWidth={1.5}
              />
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurface, marginLeft: Spacing.md }}
              >
                Push Notifications
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={onPushToggle}
              color={theme.colors.primary}
            />
          </View>
        </Surface>

        {/* Account */}
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.primary,
            fontWeight: '700',
            marginTop: Spacing.xl,
            marginBottom: Spacing.md,
          }}
        >
          Account
        </Text>
        <Surface
          style={[s.card, { backgroundColor: Palette.light.surface }]}
          elevation={1}
        >
          <Pressable
            style={s.row}
            onPress={() => router.push('/(profile)/change-password' as any)}
          >
            <View style={s.rowLeft}>
              <Lock
                size={20}
                color={theme.colors.onSurface}
                strokeWidth={1.5}
              />
              <Text
                variant="bodyLarge"
                style={{
                  color: theme.colors.onSurface,
                  marginLeft: Spacing.md,
                }}
              >
                Change Password
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
          <Divider style={{ marginHorizontal: Spacing.md }} />
          <Pressable
            style={s.row}
            onPress={() => router.push('/(profile)/delete-account' as any)}
          >
            <View style={s.rowLeft}>
              <Trash2
                size={20}
                color={theme.colors.error}
                strokeWidth={1.5}
              />
              <Text
                variant="bodyLarge"
                style={{
                  color: theme.colors.error,
                  marginLeft: Spacing.md,
                }}
              >
                Delete Account
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        </Surface>

        {/* Legal & Support */}
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.primary,
            fontWeight: '700',
            marginTop: Spacing.xl,
            marginBottom: Spacing.md,
          }}
        >
          Legal & Support
        </Text>
        <Surface
          style={[s.card, { backgroundColor: Palette.light.surface }]}
          elevation={1}
        >
          <Pressable
            style={s.row}
            onPress={() => router.push('/(legal)/terms' as any)}
          >
            <View style={s.rowLeft}>
              <FileText
                size={20}
                color={theme.colors.onSurface}
                strokeWidth={1.5}
              />
              <Text
                variant="bodyLarge"
                style={{
                  color: theme.colors.onSurface,
                  marginLeft: Spacing.md,
                }}
              >
                Terms & Conditions
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
          <Divider style={{ marginHorizontal: Spacing.md }} />
          <Pressable
            style={s.row}
            onPress={() => router.push('/(legal)/privacy' as any)}
          >
            <View style={s.rowLeft}>
              <Shield
                size={20}
                color={theme.colors.onSurface}
                strokeWidth={1.5}
              />
              <Text
                variant="bodyLarge"
                style={{
                  color: theme.colors.onSurface,
                  marginLeft: Spacing.md,
                }}
              >
                Privacy Policy
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
          <Divider style={{ marginHorizontal: Spacing.md }} />
          <Pressable
            style={s.row}
            onPress={() => Linking.openURL('mailto:support@rawy.app')}
          >
            <View style={s.rowLeft}>
              <CircleHelp
                size={20}
                color={theme.colors.onSurface}
                strokeWidth={1.5}
              />
              <Text
                variant="bodyLarge"
                style={{
                  color: theme.colors.onSurface,
                  marginLeft: Spacing.md,
                }}
              >
                Help & Support
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        </Surface>

        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
            marginTop: Spacing.xxl,
          }}
        >
          Rawy v{appVersion}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { borderRadius: Radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
});
