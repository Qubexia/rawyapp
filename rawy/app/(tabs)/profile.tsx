/**
 * Profile tab — user info, settings, logout.
 */

import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Surface,
  Button,
  Divider,
  useTheme,
  IconButton,
} from "react-native-paper";
import { useRouter } from "expo-router";
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  Mic,
  LayoutDashboard,
  Shield,
  Mail,
  Edit2,
  BadgeCheck,
  Music2,
  PlayCircle,
} from "lucide-react-native";

import { useAuthContext } from "@/context/auth-context";
import { usePlayer } from "@/context/player-context";
import { usePublicProfile } from "@/hooks/queries/use-users";
import { Palette, Spacing, Radius } from "@/constants/theme";
import { isCreator, isAdmin } from "@/utils/roles";
import { resolveImageUrl } from "@/utils/url";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { currentEpisode, isPlaying } = usePlayer();
  const { data: profile } = usePublicProfile(user?._id || "");
  const avatarUri = resolveImageUrl(user?.avatarUrl);

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
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
              fontWeight: "600",
            }}
          >
            Sign in to your account
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: Spacing.xs,
              textAlign: "center",
            }}
          >
            Manage your profile and preferences
          </Text>
          <Button
            mode="contained"
            onPress={() => router.push("/(auth)/login")}
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
    ...(isCreator(user)
      ? [
          {
            icon: LayoutDashboard,
            label: "Creator Dashboard",
            subtitle: "Manage your podcasts",
            onPress: () => router.push("/(creator)/creator-dashboard" as any),
          },
          {
            icon: Mic,
            label: "Creator Profile",
            subtitle: "Edit your public creator info",
            onPress: () =>
              router.push("/(creator)/edit-creator-profile" as any),
          },
        ]
      : [
          {
            icon: Mic,
            label: "Claim a Podcast",
            subtitle: "Verify ownership to unlock creator tools",
            onPress: () => router.push("/claim" as any),
          },
        ]),
    {
      icon: Settings,
      label: "Settings",
      subtitle: "App preferences",
      onPress: () => router.push("/(profile)/settings" as any),
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      subtitle: "Account protection",
      onPress: () => {},
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
              backgroundColor: Palette.light.surface,
            },
          ]}
          elevation={1}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: Palette.primary[100],
              },
              { overflow: "hidden" },
            ]}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
            ) : (
              <User size={32} color={Palette.primary[500]} />
            )}
          </View>
          <View style={styles.userInfo}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 1,
                  gap: 4,
                }}
              >
                <Text
                  variant="titleLarge"
                  numberOfLines={1}
                  style={{
                    color: theme.colors.onSurface,
                    fontWeight: "700",
                  }}
                >
                  {user?.name || "User"}
                </Text>
              </View>
              <IconButton
                icon={() => (
                  <Edit2 size={18} color={theme.colors.onSurfaceVariant} />
                )}
                size={20}
                onPress={() => router.push("/(profile)/edit-profile" as any)}
                style={{ margin: 0 }}
              />
            </View>
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
                {isCreator(user)
                  ? "🎙 Creator"
                  : isAdmin(user)
                    ? "👑 Admin"
                    : "🎧 Listener"}
              </Text>
            </View>
            {profile && (
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() =>
                    router.push(`/followers?userId=${user?._id}` as any)
                  }
                >
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.statValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {profile.followerCount || 0}
                  </Text>
                  <Text variant="labelSmall" style={styles.statLabel}>
                    Followers
                  </Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.statDivider,
                    { backgroundColor: Palette.light.border },
                  ]}
                />
                <TouchableOpacity
                  style={styles.statItem}
                  onPress={() =>
                    router.push(`/following?userId=${user?._id}` as any)
                  }
                >
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.statValue,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {profile.followingCount || 0}
                  </Text>
                  <Text variant="labelSmall" style={styles.statLabel}>
                    Following
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Surface>

        {/* Listening To Banner */}
        {currentEpisode && (
          <TouchableOpacity
            style={[
              styles.listeningCard,
              { backgroundColor: Palette.primary[50] }, // Always somewhat accented
            ]}
            onPress={() => router.push("/player" as any)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.listeningIconBox,
                { backgroundColor: Palette.primary[100] },
              ]}
            >
              {isPlaying ? (
                <Music2 size={24} color={Palette.primary[600]} />
              ) : (
                <PlayCircle size={24} color={Palette.primary[600]} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text
                variant="labelMedium"
                style={{ color: Palette.primary[600], fontWeight: "700" }}
              >
                {isPlaying ? "LISTENING TO..." : "PAUSED"}
              </Text>
              <Text
                variant="bodyMedium"
                numberOfLines={1}
                style={{ color: Palette.primary[900], fontWeight: "600" }}
              >
                {currentEpisode.title}
              </Text>
            </View>
            <ChevronRight size={20} color={Palette.primary[400]} />
          </TouchableOpacity>
        )}

        {/* Menu */}
        <Surface
          style={[
            styles.menuCard,
            {
              backgroundColor: Palette.light.surface,
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
                      backgroundColor: Palette.primary[50],
                    },
                  ]}
                >
                  <item.icon size={20} color={Palette.primary[500]} />
                </View>
                <View style={styles.menuLabel}>
                  <Text
                    variant="titleSmall"
                    style={{
                      color: theme.colors.onSurface,
                      fontWeight: "600",
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
                <ChevronRight size={20} color={theme.colors.onSurfaceVariant} />
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
    fontWeight: "700",
  },
  // ── User card ──
  userCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  roleChip: {
    backgroundColor: Palette.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.primary[700],
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontWeight: "800",
  },
  statLabel: {
    color: "#64748B", // Same as hex for light/dark generic
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    marginHorizontal: Spacing.md,
  },
  // ── Menu ──
  menuCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
  },
  // ── Logout ──
  logoutButton: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderColor: "#EF4444",
  },
  logoutContent: {
    height: 48,
  },
  // ── Auth prompt ──
  authPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  listeningCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  listeningIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
