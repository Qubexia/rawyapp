/**
 * Creator profile screen — bio, podcasts, follow.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Surface,
  Button,
  IconButton,
  useTheme,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Mic,
  Headphones,
  UserPlus,
  UserCheck,
  Globe,
  Twitter,
  Instagram,
  Youtube,
  Radio,
} from "lucide-react-native";

import { EmptyState } from "@/components/ui";
import { useCreator } from "@/hooks/queries/use-creators";
import { usePublicProfile } from "@/hooks/queries/use-users";
import { usePodcasts } from "@/hooks/queries/use-podcasts";
import { useFollowStatus, useToggleFollow } from "@/hooks/queries/use-follows";
import { useAuthContext } from "@/context/auth-context";
import { resolveImageUrl } from "@/utils/url";
import { Palette, Spacing, Radius } from "@/constants/theme";
import type { Podcast } from "@/services/podcasts.service";

export default function CreatorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const { data: creator, isLoading, refetch: refetchCreator } = useCreator(id);
  const { data: podcastsData, refetch: refetchPodcasts } = usePodcasts(
    { creatorId: creator?.userId },
    { enabled: !!creator?.userId }
  );

  // Follow operations must use the creator's userId (User._id), NOT the
  // creator-profile _id that comes from the route param.
  const creatorUserId = creator?.userId ?? '';
  const { data: followStatus, refetch: refetchFollowStatus } =
    useFollowStatus(creatorUserId, { enabled: !!creatorUserId });
  const toggleFollow = useToggleFollow(creatorUserId);

  const { data: publicUser } = usePublicProfile(creator?.userId ?? "");
  const displayName = creator?.showName || publicUser?.name || "Creator";

  const podcasts = podcastsData?.pages.flatMap((p) => p.data) ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchCreator(),
      refetchPodcasts(),
      refetchFollowStatus(),
    ]);
    setRefreshing(false);
  }, [refetchCreator, refetchPodcasts, refetchFollowStatus]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[s.root, { backgroundColor: theme.colors.background }]}
      >
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Use the user's personal avatar as the single source of truth for profile images
  const avatarUri = resolveImageUrl(publicUser?.avatarUrl);
  const isOwner = creator?.userId?.toString() === user?._id?.toString();
  const followerCount =
    followStatus?.followerCount ?? creator?.followerCount ?? 0;
  const podcastCount = creator?.podcastCount || podcasts.length;

  const socialLinks = creator?.socialLinks;
  const hasSocialLinks =
    socialLinks &&
    (socialLinks.website ||
      socialLinks.twitter ||
      socialLinks.instagram ||
      socialLinks.youtube);

  const renderPodcast = ({ item }: { item: Podcast }) => {
    const coverUri = resolveImageUrl(item.coverImageUrl);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/podcast/${item._id}` as any)}
      >
        <Surface
          style={[s.podcastRow, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        >
          <View style={s.podcastCover}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={s.podcastCoverImg} />
            ) : (
              <View
                style={[
                  s.podcastCoverPlaceholder,
                  { backgroundColor: Palette.primary[100] },
                ]}
              >
                <Headphones
                  size={20}
                  color={Palette.primary[500]}
                  strokeWidth={1.5}
                />
              </View>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              variant="titleSmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSurface, fontWeight: "600" }}
            >
              {item.title}
            </Text>
            {item.description ? (
              <Text
                variant="bodySmall"
                numberOfLines={1}
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
              >
                {item.description}
              </Text>
            ) : null}
            <View style={s.podcastMeta}>
              <Radio size={11} color={theme.colors.onSurfaceVariant} />
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
              >
                {item.episodeCount || 0} episodes
              </Text>
            </View>
          </View>
          <View
            style={[s.podcastChevron, { backgroundColor: Palette.primary[50] }]}
          >
            <Headphones
              size={16}
              color={Palette.primary[500]}
              strokeWidth={1.5}
            />
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  const Header = () => (
    <>
      {/* ── Hero ── */}
      <View style={[s.hero, { backgroundColor: theme.colors.surface }]}>
        {/* Avatar */}
        <View>
          <View style={[s.avatarRing, { borderColor: theme.colors.primary }]}>
            <View style={[s.avatar, { backgroundColor: Palette.primary[100] }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={s.avatarImg} />
              ) : (
                <Mic size={40} color={Palette.primary[500]} />
              )}
            </View>
          </View>
        </View>

        {/* Name */}
        <Text
          variant="headlineLarge"
          style={[s.heroName, { color: theme.colors.onSurface }]}
        >
          {displayName}
        </Text>
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}
        >
          {creator?.showName ? `@${creator.showName}` : null}
        </Text>

        {/* Bio */}
        {creator?.bio ? (
          <Text
            variant="bodyMedium"
            style={[s.heroBio, { color: theme.colors.onSurfaceVariant }]}
          >
            {creator.bio}
          </Text>
        ) : null}

        {/* Stats */}
        <View style={[s.statsRow, { borderColor: Palette.light.border }]}>
          <View style={s.statItem}>
            <Text
              variant="titleLarge"
              style={[s.statValue, { color: theme.colors.onSurface }]}
            >
              {followerCount}
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Followers
            </Text>
          </View>
          <View
            style={[s.statDivider, { backgroundColor: Palette.light.border }]}
          />
          <View style={s.statItem}>
            <Text
              variant="titleLarge"
              style={[s.statValue, { color: theme.colors.onSurface }]}
            >
              {podcastCount}
            </Text>
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Podcasts
            </Text>
          </View>
        </View>

        {/* Follow button */}
        {!isOwner && (
          <Button
            mode={followStatus?.isFollowing ? "outlined" : "contained"}
            onPress={() => {
              if (!user) {
                router.push("/(auth)/login" as any);
                return;
              }
              toggleFollow.mutate(followStatus?.isFollowing || false);
            }}
            loading={toggleFollow.isPending}
            icon={() =>
              followStatus?.isFollowing ? (
                <UserCheck size={18} color={theme.colors.primary} />
              ) : (
                <UserPlus size={18} color="#FFF" />
              )
            }
            style={s.followBtn}
            contentStyle={{ height: 46 }}
          >
            {followStatus?.isFollowing ? "Following" : "Follow"}
          </Button>
        )}

        {/* Social links */}
        {hasSocialLinks ? (
          <View style={s.socialRow}>
            {socialLinks?.website ? (
              <TouchableOpacity
                style={[s.socialBtn, { backgroundColor: Palette.primary[50] }]}
                onPress={() => Linking.openURL(socialLinks.website!)}
              >
                <Globe size={18} color={Palette.primary[500]} />
              </TouchableOpacity>
            ) : null}
            {socialLinks?.twitter ? (
              <TouchableOpacity
                style={[s.socialBtn, { backgroundColor: Palette.primary[50] }]}
                onPress={() =>
                  Linking.openURL(`https://twitter.com/${socialLinks.twitter}`)
                }
              >
                <Twitter size={18} color={Palette.primary[500]} />
              </TouchableOpacity>
            ) : null}
            {socialLinks?.instagram ? (
              <TouchableOpacity
                style={[s.socialBtn, { backgroundColor: Palette.primary[50] }]}
                onPress={() =>
                  Linking.openURL(
                    `https://instagram.com/${socialLinks.instagram}`,
                  )
                }
              >
                <Instagram size={18} color={Palette.primary[500]} />
              </TouchableOpacity>
            ) : null}
            {socialLinks?.youtube ? (
              <TouchableOpacity
                style={[s.socialBtn, { backgroundColor: Palette.primary[50] }]}
                onPress={() =>
                  Linking.openURL(`https://youtube.com/${socialLinks.youtube}`)
                }
              >
                <Youtube size={18} color={Palette.primary[500]} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* ── Section header ── */}
      {podcasts.length > 0 && (
        <View style={s.sectionHeader}>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onBackground, fontWeight: "700" }}
          >
            Podcasts
          </Text>
          <Chip
            compact
            icon="podcast"
            style={{ backgroundColor: Palette.primary[50] }}
          >
            <Text variant="labelSmall" style={{ color: Palette.primary[500] }}>
              {podcastCount}
            </Text>
          </Chip>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView
      style={[s.root, { backgroundColor: theme.colors.background }]}
    >
      {/* Top bar */}
      <View style={[s.topBar, { borderBottomColor: Palette.light.border }]}>
        <IconButton
          icon={() => <ArrowLeft size={22} color={theme.colors.onBackground} />}
          onPress={() => router.back()}
        />
        <Text
          variant="titleMedium"
          style={{ fontWeight: "700", color: theme.colors.onBackground }}
        >
          Creator
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <FlatList
        data={podcasts}
        keyExtractor={(i, index) => (i?._id ? String(i._id) : String(index))}
        renderItem={renderPodcast}
        ListHeaderComponent={Header}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <EmptyState
            icon={
              <Headphones
                size={32}
                color={theme.colors.onSurfaceVariant}
                strokeWidth={1}
              />
            }
            message="No podcasts yet"
          />
        )}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 108;

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  /* Hero card */
  hero: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: Radius.xl,
  },
  avatarRing: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", resizeMode: "cover" },

  heroName: { fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
  heroBio: {
    textAlign: "center",
    lineHeight: 22,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    width: "90%",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontWeight: "800" },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    marginHorizontal: Spacing.lg,
  },

  /* Follow */
  followBtn: {
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    minWidth: 160,
  },

  /* Social */
  socialRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },

  /* Podcast row */
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  podcastRow: {
    flexDirection: "row",
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  podcastCover: {
    width: 54,
    height: 54,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  podcastCoverImg: { width: "100%", height: "100%", resizeMode: "cover" },
  podcastCoverPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  podcastMeta: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  podcastChevron: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
