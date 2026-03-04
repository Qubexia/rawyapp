/**
 * Profile tab — user info, settings, logout.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  Button,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  Mic,
  LayoutDashboard,
  Shield,
  Mail,
} from 'lucide-react-native';

import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthContext();

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.authPrompt}>
          <User
            size={48}
            color={theme.colors.onSurfaceVariant}
            strokeWidth={1}
          />
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onSurface,
              marginTop: Spacing.md,
              fontWeight: '600',
            }}
          >
            Sign in to your account
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: Spacing.xs,
              textAlign: 'center',
            }}
          >
            Manage your profile and preferences
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push('/login')}
            style={{ marginTop: Spacing.lg, borderRadius: Radius.md }}
            contentStyle={{ height: 48 }}
          >
            Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    ...((user?.role === 'creator' || user?.role === 'CREATOR')
      ? [
          {
            icon: LayoutDashboard,
            label: 'Creator Dashboard',
            subtitle: 'Manage your podcasts',
            onPress: () => router.push('/creator-dashboard' as any),
          },
        ]
      : [
          {
            icon: Mic,
            label: 'Become a Creator',
            subtitle: 'Start your podcast journey',
            onPress: () => {},
          },
        ]),
    {
      icon: Settings,
      label: 'Settings',
      subtitle: 'App preferences',
      onPress: () => {},
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      subtitle: 'Account protection',
      onPress: () => {},
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Profile
          </Text>
        </View>

        {/* User card */}
        <Surface
          style={[
            styles.userCard,
            {
              backgroundColor: isDark
                ? Palette.dark.surfaceVariant
                : Palette.light.surface,
            },
          ]}
          elevation={1}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isDark
                  ? Palette.dark.elevated
                  : Palette.primary[100],
              },
            ]}
          >
            <User
              size={32}
              color={isDark ? Palette.primary[300] : Palette.primary[500]}
            />
          </View>
          <View style={styles.userInfo}>
            <Text
              variant="titleLarge"
              style={{ color: theme.colors.onSurface, fontWeight: '700' }}
            >
              {user?.name || 'User'}
            </Text>
            <View style={styles.emailRow}>
              <Mail size={14} color={theme.colors.onSurfaceVariant} />
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  marginLeft: 6,
                }}
              >
                {user?.email}
              </Text>
            </View>
            <View style={styles.roleChip}>
              <Text style={styles.roleText}>
                {(user?.role === 'creator' || user?.role === 'CREATOR')
                  ? '🎙 Creator'
                  : (user?.role === 'admin' || user?.role === 'ADMIN')
                    ? '👑 Admin'
                    : '🎧 Listener'}
              </Text>
            </View>
          </View>
        </Surface>

        {/* Menu */}
        <Surface
          style={[
            styles.menuCard,
            {
              backgroundColor: isDark
                ? Palette.dark.surfaceVariant
                : Palette.light.surface,
            },
          ]}
          elevation={1}
        >
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label || index}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.menuIconBox,
                    {
                      backgroundColor: isDark
                        ? Palette.dark.elevated
                        : Palette.primary[50],
                    },
                  ]}
                >
                  <item.icon
                    size={20}
                    color={
                      isDark ? Palette.primary[300] : Palette.primary[500]
                    }
                  />
                </View>
                <View style={styles.menuLabel}>
                  <Text
                    variant="titleSmall"
                    style={{
                      color: theme.colors.onSurface,
                      fontWeight: '600',
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
              {index < menuItems.length - 1 && (
                <Divider style={{ marginHorizontal: Spacing.md }} />
              )}
            </React.Fragment>
          ))}
        </Surface>

        {/* Logout */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutContent}
          textColor={theme.colors.error}
          icon={() => <LogOut size={18} color={theme.colors.error} />}
        >
          Sign Out
        </Button>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontWeight: '700',
  },
  // ── User card ──
  userCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roleChip: {
    backgroundColor: Palette.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primary[700],
  },
  // ── Menu ──
  menuCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
  },
  // ── Logout ──
  logoutButton: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderColor: '#EF4444',
  },
  logoutContent: {
    height: 48,
  },
  // ── Auth prompt ──
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
