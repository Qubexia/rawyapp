/**
 * Home screen — trending podcasts, personalized feed, followed creators.
 */

import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {
  Bell,
  TrendingUp,
  Headphones,
  Play,
  Star,
} from 'lucide-react-native';

import {
  PodcastCard,
  EpisodeRow,
  EmptyState,
  GuestBanner,
  CreatorCard,
  ErrorBoundary,
} from '@/components/ui';
import { useAuthContext } from '@/context/auth-context';
import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useHomeFeed } from '@/hooks/queries/use-feed';
import { useTopCreators } from '@/hooks/queries/use-creators';
import { useUnreadCount } from '@/hooks/queries/use-notifications';
import { useSuggestions } from '@/hooks/queries/use-suggestions';
import { WhoToFollow } from '@/components/home/WhoToFollow';
import { Spacing, Radius } from '@/constants/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

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

  const { refetch: refetchSuggestions } = useSuggestions(10, { enabled: !!user });

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
  }, [refetchPodcasts, refetchFeed, refetchTopCreators, refetchSuggestions, user]);

  const podcasts = podcastsData?.pages.flatMap((p) => p.data || []) ?? [];
  const topCreators = (topCreatorsData ?? []).filter((c) => c.userId !== user?._id);

  const followingEpisodes = feedData?.following.data ?? [];
  const recommendedEpisodes = feedData?.recommended.data ?? [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const isLoading = podcastsLoading || feedLoading || topCreatorsLoading;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ErrorBoundary onReset={onRefresh}>
        <ScrollView
          showsVerticalScrollIndicator={false}
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
          <View style={styles.header}>
            <View>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {greeting()} 👋
              </Text>
              <Text
                variant="headlineSmall"
                style={[styles.userName, { color: theme.colors.onBackground }]}
              >
                {user?.name || 'Listener'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => router.push('/(profile)/notifications' as any)}
            >
              <View style={{ position: 'relative' }}>
                <Bell size={24} color={theme.colors.onSurfaceVariant} />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      right: -2,
                      top: -2,
                      backgroundColor: theme.colors.error,
                      borderRadius: 7,
                      width: 14,
                      height: 14,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: theme.colors.background,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFF',
                        fontSize: 7,
                        fontWeight: '900',
                        lineHeight: 10,
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {!user && <GuestBanner />}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              {/* ── Trending Podcasts ── */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={20} color={theme.colors.primary} />
                  <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
                  >
                    Trending Podcasts
                  </Text>
                </View>
                {podcasts.length > 0 ? (
                  <FlatList
                    horizontal
                    data={podcasts}
                    keyExtractor={(item, index) => (item?._id ? String(item._id) : String(index))}
                    renderItem={({ item }) => <PodcastCard podcast={item} />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                  />
                ) : (
                  <EmptyState
                    icon={<Headphones size={32} color={theme.colors.onSurfaceVariant} strokeWidth={1} />}
                    message="No podcasts yet. Be the first!"
                    isCard
                  />
                )}
              </View>

              {user && <WhoToFollow />}

              {/* ── New From Following ── */}
              {user && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Star size={20} color={theme.colors.primary} />
                    <Text
                      variant="titleMedium"
                      style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
                    >
                      From Your Following
                    </Text>
                  </View>
                  {followingEpisodes.length > 0 ? (
                    <FlatList
                      horizontal
                      data={followingEpisodes}
                      keyExtractor={(item) => item._id}
                      renderItem={({ item }) => (
                        <View style={{ width: 280, marginRight: Spacing.md }}>
                          <EpisodeRow episode={item} />
                        </View>
                      )}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalList}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={5}
                      windowSize={5}
                    />
                  ) : (
                    <View style={{ paddingHorizontal: Spacing.lg }}>
                      <TouchableOpacity
                        onPress={() => router.push('/(tabs)/explore')}
                        style={[styles.emptyFollowing, { backgroundColor: theme.colors.surfaceVariant }]}
                      >
                        <Headphones size={24} color={theme.colors.primary} style={{ marginBottom: 4 }} />
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                          Explore and follow creators to personalize your feed
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* ── Recommended / Trending Episodes ── */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Play size={20} color={theme.colors.primary} fill={theme.colors.primary} />
                  <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
                  >
                    Recommended for You
                  </Text>
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
                    icon={<Play size={32} color={theme.colors.onSurfaceVariant} strokeWidth={1} />}
                    message="No episodes found"
                    isCard
                  />
                )}
              </View>

              {/* ── Top Creators ── */}
              {topCreators.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Star size={20} color={theme.colors.primary} />
                    <Text
                      variant="titleMedium"
                      style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
                    >
                      Top Creators
                    </Text>
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
        </ScrollView>
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  userName: {
    fontWeight: '700',
    marginTop: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
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
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
