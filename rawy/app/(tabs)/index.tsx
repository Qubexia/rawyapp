/**
 * Home screen — trending podcasts, personalized feed, followed creators.
 */

import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text, useTheme } from "react-native-paper";
import {
  Bell,
  TrendingUp,
  Headphones,
  Play,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  PodcastCard,
  EpisodeRow,
  EpisodeCard,
  EmptyState,
  GuestBanner,
  CreatorCard,
  ErrorBoundary,
  HomeSkeleton,
} from "@/components/ui";
import { useAuthContext } from "@/context/auth-context";
import { usePlayer } from "@/context/player-context";
import { resolveImageUrl } from "@/utils/url";
import { usePodcasts } from "@/hooks/queries/use-podcasts";
import { useHomeFeed } from "@/hooks/queries/use-feed";
import { useTopCreators } from "@/hooks/queries/use-creators";
import { useUnreadCount } from "@/hooks/queries/use-notifications";
import { useSuggestions } from "@/hooks/queries/use-suggestions";
import { WhoToFollow } from "@/components/home/WhoToFollow";
import { Palette, Spacing, Radius } from "@/constants/theme";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { currentEpisode, togglePlay, isPlaying } = usePlayer();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // const headerAnimatedStyle = useAnimatedStyle(() => {
  //   const opacity = interpolate(
  //     scrollY.value,
  //     [0, 40],
  //     [0, 1],
  //     Extrapolation.CLAMP,
  //   );
  //   return { opacity };
  // });

  const { data: unreadData } = useUnreadCount({ enabled: !!user });
  const unreadCount = unreadData?.unreadCount || 0;

  const {
    data: podcastsData,
    isLoading: podcastsLoading,
    refetch: refetchPodcasts,
  } = usePodcasts();

  const {
    data: feedData,
    isLoading: feedLoading,
    refetch: refetchFeed,
  } = useHomeFeed();

  const {
    data: topCreatorsData,
    isLoading: topCreatorsLoading,
    refetch: refetchTopCreators,
  } = useTopCreators();

  const { refetch: refetchSuggestions } = useSuggestions(10, {
    enabled: !!user,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const promises: Promise<any>[] = [
      refetchPodcasts(),
      refetchFeed(),
      refetchTopCreators(),
    ];
    if (user) {
      promises.push(refetchSuggestions());
    }
    await Promise.all(promises);
    setRefreshing(false);
  }, [
    refetchPodcasts,
    refetchFeed,
    refetchTopCreators,
    refetchSuggestions,
    user,
  ]);

  const podcasts = podcastsData?.pages.flatMap((p) => p.data || []) ?? [];
  const topCreators = (topCreatorsData ?? []).filter(
    (c) => c.userId !== user?._id,
  );

  const followingEpisodes = feedData?.following.data ?? [];
  const recommendedEpisodes = feedData?.recommended.data ?? [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const isLoading = podcastsLoading || feedLoading || topCreatorsLoading;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* ── Sticky Glass Header ── */}
      {/* <Animated.View style={[styles.glassHeaderContainer, headerAnimatedStyle]}>
        <BlurView intensity={80} tint={theme.dark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
        <SafeAreaView edges={["top"]} style={styles.glassHeaderSafeArea}>
          <View style={styles.glassHeaderContent}>
            <Text variant="titleMedium" style={{ fontWeight: "700", color: theme.colors.onBackground }}>
              Rawy
            </Text>
            <TouchableOpacity onPress={() => router.push("/(profile)/notifications" as any)}>
              <View style={{ position: "relative" }}>
                <Bell size={24} color={theme.colors.onSurfaceVariant} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View> */}

      <ErrorBoundary onReset={onRefresh}>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* ... existing header and sections ... */}
          {/* Re-implementing the content with ErrorBoundary */}
          <View
            style={styles.header}
          >
            <View>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {greeting()} 👋
              </Text>
              <Text
                variant="headlineSmall"
                style={[styles.userName, { color: theme.colors.onBackground }]}
              >
                {user?.name || "Listener"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => router.push("/(profile)/notifications" as any)}
            >
              <View style={{ position: "relative" }}>
                <Bell size={24} color={theme.colors.onSurfaceVariant} />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      right: -2,
                      top: -2,
                      backgroundColor: theme.colors.error,
                      borderRadius: 7,
                      width: 14,
                      height: 14,
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1.5,
                      borderColor: theme.colors.background,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 7,
                        fontWeight: "900",
                        lineHeight: 10,
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {!user && <GuestBanner />}

          {/* ── Continue Listening Hero ── */}
          {user && currentEpisode && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Headphones size={20} color={theme.colors.primary} />
                <Text
                  variant="titleMedium"
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Continue Listening
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/player" as any)}
                style={styles.heroCard}
              >
                <Image
                  source={{
                    uri: resolveImageUrl(currentEpisode.podcast.coverImageUrl),
                  }}
                  style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
                  blurRadius={10}
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: "rgba(0,0,0,0.5)" },
                  ]}
                />
                <View style={styles.heroContent}>
                  <Image
                    source={{
                      uri: resolveImageUrl(
                        currentEpisode.podcast.coverImageUrl,
                      ),
                    }}
                    style={styles.heroCover}
                  />
                  <View style={styles.heroInfo}>
                    <Text
                      variant="titleMedium"
                      numberOfLines={2}
                      style={styles.heroTitle}
                    >
                      {currentEpisode.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.heroSubtitle}>
                      {currentEpisode.podcast.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.heroPlayBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                  >
                    {isPlaying ? (
                      <Play size={24} color="#000" fill="#000" />
                    ) : (
                      <Play size={24} color="#000" fill="#000" />
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {isLoading ? (
            <HomeSkeleton />
          ) : (
            <>
              {/* ── Trending Podcasts ── */}
              <View style={styles.section}>
                <View
                  style={[
                    styles.sectionHeader,
                    { justifyContent: "space-between" },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TrendingUp size={20} color={theme.colors.primary} />
                    <Text
                      variant="titleMedium"
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      Trending Podcasts
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.seeAllBtn}>
                    <Text
                      style={[
                        styles.seeAllText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      See All
                    </Text>
                    <ChevronRight size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
                {podcasts.length > 0 ? (
                  <FlatList
                    horizontal
                    data={podcasts}
                    keyExtractor={(item, index) =>
                      item?._id ? String(item._id) : String(index)
                    }
                    renderItem={({ item }) => <PodcastCard podcast={item} />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                  />
                ) : (
                  <EmptyState
                    icon={
                      <Headphones
                        size={32}
                        color={theme.colors.onSurfaceVariant}
                        strokeWidth={1}
                      />
                    }
                    message="No podcasts yet. Be the first!"
                    isCard
                  />
                )}
              </View>

              {user && <WhoToFollow />}

              {/* ── New From Following ── */}
              {user && (
                <View style={[styles.section]}>
                  <View
                    style={[
                      styles.sectionHeader,
                      { justifyContent: "space-between" },
                    ]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Star size={20} color={theme.colors.primary} />
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.sectionTitle,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        From Your Following
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.seeAllBtn}>
                      <Text
                        style={[
                          styles.seeAllText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        See All
                      </Text>
                      <ChevronRight size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  {followingEpisodes.length > 0 ? (
                    <FlatList
                      horizontal
                      data={followingEpisodes}
                      keyExtractor={(item) => item._id}
                      renderItem={({ item }) => (
                        <EpisodeCard
                          episode={item}
                          style={{ marginRight: Spacing.md }}
                        />
                      )}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalList}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={5}
                      windowSize={5}
                    />
                  ) : (
                    <View style={{ paddingHorizontal: Spacing.lg }}>
                      <View style={styles.emptyFollowing}>
                        <Headphones
                          size={40}
                          color={theme.colors.primary}
                          style={{ marginBottom: Spacing.md, opacity: 0.8 }}
                          strokeWidth={1.5}
                        />
                        <Text
                          variant="titleMedium"
                          style={{
                            color: theme.colors.onSurface,
                            fontWeight: "700",
                            marginBottom: Spacing.xs,
                          }}
                        >
                          Find Your Next Favorite
                        </Text>
                        <Text
                          variant="bodySmall"
                          style={{
                            color: theme.colors.onSurfaceVariant,
                            textAlign: "center",
                            marginBottom: Spacing.lg,
                            paddingHorizontal: Spacing.md,
                          }}
                        >
                          Explore and follow creators to personalize your feed
                          with the best content.
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => router.push("/(tabs)/explore")}
                          style={{
                            backgroundColor: theme.colors.primary,
                            paddingHorizontal: Spacing.xl,
                            paddingVertical: 12,
                            borderRadius: Radius.full,
                          }}
                        >
                          <Text
                            style={{
                              color: "#FFF",
                              fontWeight: "600",
                              fontSize: 14,
                            }}
                          >
                            Discover Creators
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* ── Recommended / Trending Episodes ── */}
              <View style={styles.section}>
                <View
                  style={[
                    styles.sectionHeader,
                    { justifyContent: "space-between" },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Sparkles size={20} color={theme.colors.primary} />
                    <Text
                      variant="titleMedium"
                      style={[
                        styles.sectionTitle,
                        { color: theme.colors.onBackground },
                      ]}
                    >
                      Recommended for You
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.seeAllBtn}>
                    <Text
                      style={[
                        styles.seeAllText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      See All
                    </Text>
                    <ChevronRight size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
                {recommendedEpisodes.length > 0 ? (
                  <View style={styles.episodeList}>
                    {recommendedEpisodes.slice(0, 10).map((episode) => (
                      <View key={episode._id}>
                        <EpisodeRow episode={episode} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <EmptyState
                    icon={
                      <Play
                        size={32}
                        color={theme.colors.onSurfaceVariant}
                        strokeWidth={1}
                      />
                    }
                    message="No episodes found"
                    isCard
                  />
                )}
              </View>

              {/* ── Top Creators ── */}
              {topCreators.length > 0 && (
                <View style={styles.section}>
                  <View
                    style={[
                      styles.sectionHeader,
                      { justifyContent: "space-between" },
                    ]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Star size={20} color={theme.colors.primary} />
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.sectionTitle,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        Top Creators
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.seeAllBtn}>
                      <Text
                        style={[
                          styles.seeAllText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        See All
                      </Text>
                      <ChevronRight size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    horizontal
                    data={topCreators}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <CreatorCard creator={item} />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                  />
                </View>
              )}
            </>
          )}
        </Animated.ScrollView>
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glassHeaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  glassHeaderSafeArea: {
    paddingBottom: Spacing.sm,
  },
  glassHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  badge: {
    position: "absolute",
    right: -2,
    top: -2,
    backgroundColor: "#EF4444",
    borderRadius: 7,
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 7,
    fontWeight: "900",
    lineHeight: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  userName: {
    fontWeight: "700",
    marginTop: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontWeight: "700",
    marginLeft: Spacing.sm,
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  episodeList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyFollowing: {
    padding: Spacing.xl,
    paddingVertical: 32,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(150,150,150,0.05)",
    borderWidth: 1,
    borderColor: "rgba(150,150,150,0.1)",
  },
  heroCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    overflow: "hidden",
    backgroundColor: "#111",
    height: 140, // Reduced from standard to save vertical space
    marginBottom: Spacing.md,
  },
  heroContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  heroCover: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    marginRight: Spacing.md,
  },
  heroInfo: {
    flex: 1,
    justifyContent: "center",
  },
  heroTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
  },
  heroPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  chipsContainer: {
    marginBottom: Spacing.lg,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: "rgba(150,150,150,0.2)",
    backgroundColor: "rgba(150,150,150,0.05)",
  },
  chipText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#6B7280", // Fixed raw fallback since Palette.text is not exported in theme.ts
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
