import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Text, Surface, IconButton, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, Users, UserCheck, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePublicProfile } from '@/hooks/queries/use-users';
import { useToggleFollow } from '@/hooks/queries/use-follows';
import { useAuthContext } from '@/context/auth-context';
import { resolveImageUrl } from '@/utils/url';
import { Palette, Spacing, Radius } from '@/constants/theme';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { user: currentUser } = useAuthContext();

  const { data: profile, isLoading, error } = usePublicProfile(id);
  const toggleFollow = useToggleFollow(id);

  const isMe = currentUser?._id === id;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${profile?.name}'s profile on Rawy!`,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[s.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[s.center, { backgroundColor: theme.colors.background }]}>
        <Text>User not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const avatarUri = resolveImageUrl(profile.avatarUrl);
  const initials = profile.name.charAt(0).toUpperCase();
  const roleLabel = profile.role.toLowerCase();

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      {/* Top bar */}
      <View style={[s.topBar, { borderBottomColor: Palette.light.border }]}>
        <IconButton
          icon={() => <ArrowLeft size={22} color={theme.colors.onBackground} />}
          onPress={() => router.back()}
        />
        <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onBackground }}>
          Profile
        </Text>
        <IconButton
          icon={() => <Share2 size={22} color={theme.colors.onBackground} />}
          onPress={handleShare}
        />
      </View>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={[s.hero, { backgroundColor: theme.colors.surface }]}>
          {/* Avatar */}
          <View style={s.avatarWrapper}>
            <View style={[s.avatarRing, { borderColor: theme.colors.primary }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avatarImg} />
              ) : (
                <View style={[s.avatarPlaceholder, { backgroundColor: Palette.primary[100] }]}>
                  <Text style={[s.avatarInitial, { color: Palette.primary[500] }]}>
                    {initials}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Name & role badge */}
          <Text variant="headlineSmall" style={[s.name, { color: theme.colors.onSurface }]}>
            {profile.name}
          </Text>
          <View style={[s.roleBadge, { backgroundColor: Palette.primary[50] }]}>
            <User size={12} color={Palette.primary[500]} />
            <Text
              variant="labelSmall"
              style={{ color: Palette.primary[500], marginLeft: 4, fontWeight: '600', textTransform: 'capitalize' }}
            >
              {roleLabel}
            </Text>
          </View>

          {/* Stats */}
          <View style={[s.statsRow, { borderColor: Palette.light.border }]}>
            <View style={s.statItem}>
              <Text variant="titleLarge" style={[s.statValue, { color: theme.colors.onSurface }]}>
                {profile.followerCount}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Followers
              </Text>
            </View>
            <View style={[s.statDivider, { backgroundColor: Palette.light.border }]} />
            <View style={s.statItem}>
              <Text variant="titleLarge" style={[s.statValue, { color: theme.colors.onSurface }]}>
                {profile.followingCount}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Following
              </Text>
            </View>
          </View>

          {/* Follow button */}
          {!isMe && (
            <Button
              mode={profile.isFollowing ? 'outlined' : 'contained'}
              onPress={() => toggleFollow.mutate(profile.isFollowing || false)}
              loading={toggleFollow.isPending}
              icon={() =>
                profile.isFollowing ? (
                  <UserCheck size={18} color={theme.colors.primary} />
                ) : (
                  <Users size={18} color="#FFF" />
                )
              }
              style={s.followBtn}
              contentStyle={{ height: 46 }}
            >
              {profile.isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </View>

        {/* ── About card ── */}
        <View style={s.section}>
          <Text variant="titleMedium" style={[s.sectionTitle, { color: theme.colors.onBackground }]}>
            About
          </Text>
          <Surface style={[s.aboutCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={[s.aboutIcon, { backgroundColor: Palette.primary[50] }]}>
              <User size={20} color={Palette.primary[500]} />
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1, lineHeight: 22 }}>
              {profile.name} is a {roleLabel} on Rawy. Explore their world of stories and podcasts.
            </Text>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 110;

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  scrollContent: { paddingBottom: Spacing.xxl },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  avatarWrapper: { marginBottom: Spacing.md },
  avatarRing: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: AVATAR_SIZE, height: AVATAR_SIZE, resizeMode: 'cover' },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 44, fontWeight: '800' },

  name: { fontWeight: '800', textAlign: 'center' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: '90%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: '800' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 32, marginHorizontal: Spacing.lg },

  followBtn: {
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    minWidth: 160,
  },

  /* About */
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionTitle: { fontWeight: '700', marginBottom: Spacing.md },
  aboutCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.md,
  },
  aboutIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
