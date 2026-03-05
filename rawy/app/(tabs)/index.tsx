/**
 * Home screen — trending podcasts, recent episodes, followed creators.
 */

import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {
  Bell,
  TrendingUp,
  Headphones,
  Play,
  Users,
} from 'lucide-react-native';

import { 
  PodcastCard, 
  EpisodeRow, 
  EmptyState,
  GuestBanner,
  CreatorChip,
} from '@/components/ui';
import { useAuthContext } from '@/context/auth-context';
import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useEpisodes } from '@/hooks/queries/use-episodes';
import { useFollowing } from '@/hooks/queries/use-follows';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Podcast } from '@/services/podcasts.service';
import type { Episode } from '@/services/episodes.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PODCAST_CARD_WIDTH = 160;

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthContext();

  const {
    data: podcastsData,
    isLoading: podcastsLoading,
    refetch: refetchPodcasts,
  } = usePodcasts();

  const {
    data: episodesData,
    isLoading: episodesLoading,
    refetch: refetchEpisodes,
  } = useEpisodes();

  const {
    data: followingData,
    isLoading: followingLoading,
    refetch: refetchFollowing,
  } = useFollowing();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const promises: Promise<any>[] = [refetchPodcasts(), refetchEpisodes()];
    if (user) {
      promises.push(refetchFollowing());
    }
    await Promise.all(promises);
    setRefreshing(false);
  }, [refetchPodcasts, refetchEpisodes, refetchFollowing, user]);

  const podcasts = podcastsData?.pages.flatMap((p) => p.data || []) ?? [];
  const episodes = episodesData?.pages.flatMap((p) => p.data || []) ?? [];
  const followedCreators = followingData?.pages.flatMap((p) => p.data || []) ?? [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ── Render helpers ──

  const renderPodcastCard = ({ item }: { item: Podcast }) => (
    <PodcastCard podcast={item} />
  );

  const renderEpisodeCard = ({ item }: { item: Episode }) => (
    <EpisodeRow episode={item} />
  );

  const isLoading = podcastsLoading || episodesLoading;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      edges={['top']}
    >
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
        {/* ── Header ── */}
        <View style={styles.header}>
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
              {user?.name || 'Listener'}
            </Text>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <Bell size={24} color={theme.colors.onSurfaceVariant} />
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
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Trending Podcasts
                </Text>
              </View>
              {podcasts.length > 0 ? (
                <FlatList
                  horizontal
                  data={podcasts}
                  keyExtractor={(item, index) => item?._id ? String(item._id) : String(index)}
                  renderItem={renderPodcastCard}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
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

            {/* ── Following Section ── */}
            {user && followedCreators.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Users size={20} color={theme.colors.primary} />
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.onBackground },
                    ]}
                  >
                    Creators You Follow
                  </Text>
                </View>
                <FlatList
                  horizontal
                  data={followedCreators}
                  renderItem={({ item }) => (
                    <View style={{ marginRight: Spacing.sm }}>
                      <CreatorChip creator={item} />
                    </View>
                  )}
                  keyExtractor={(item) => item._id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
                />
              </View>
            )}

            {/* ── Recent Episodes ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Play
                  size={20}
                  color={theme.colors.primary}
                  fill={theme.colors.primary}
                />
                <Text
                  variant="titleMedium"
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.onBackground },
                  ]}
                >
                  Recent Episodes
                </Text>
              </View>
              {episodes.length > 0 ? (
                <View style={styles.episodeList}>
                  {episodes.slice(0, 10).map((episode) => {
                    if (!episode) return null;
                    return (
                      <View key={episode._id || Math.random().toString()}>
                        {renderEpisodeCard({ item: episode })}
                      </View>
                    );
                  })}
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
                  message="No episodes yet"
                  isCard
                />
              )}
            </View>
          </>
        )}

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
  },
  episodeList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
});
