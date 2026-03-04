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
  Avatar,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import {
  Bell,
  Play,
  Clock,
  TrendingUp,
  Headphones,
} from 'lucide-react-native';

import { useAuthContext } from '@/context/auth-context';
import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useEpisodes } from '@/hooks/queries/use-episodes';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Podcast } from '@/services/podcasts.service';
import type { Episode } from '@/services/episodes.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PODCAST_CARD_WIDTH = 160;

export default function HomeScreen() {
  const theme = useTheme();
  const isDark = false;
  const router = useRouter();
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

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchPodcasts(), refetchEpisodes()]);
    setRefreshing(false);
  }, [refetchPodcasts, refetchEpisodes]);

  const podcasts = podcastsData?.pages.flatMap((p) => p.data || []) ?? [];
  const episodes = episodesData?.pages.flatMap((p) => p.data || []) ?? [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ── Render helpers ──

  const renderPodcastCard = ({ item }: { item: Podcast }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/podcast/${item._id}` as any)}
      style={styles.podcastCard}
    >
      <Surface
        style={[
          styles.podcastCardInner,
          {
            backgroundColor: isDark
              ? Palette.dark.surfaceVariant
              : Palette.light.surfaceVariant,
          },
        ]}
        elevation={1}
      >
        <View
          style={[
            styles.podcastCover,
            { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[100] },
          ]}
        >
          <Headphones
            size={32}
            color={isDark ? Palette.primary[300] : Palette.primary[500]}
            strokeWidth={1.5}
          />
        </View>
        <Text
          variant="titleSmall"
          numberOfLines={2}
          style={[styles.podcastTitle, { color: theme.colors.onSurface }]}
        >
          {item.title}
        </Text>
        <Text
          variant="bodySmall"
          numberOfLines={1}
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {item.creator?.name || 'Unknown'}
        </Text>
      </Surface>
    </TouchableOpacity>
  );

  const renderEpisodeCard = ({ item }: { item: Episode }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/episode/${item._id}` as any)}
    >
      <Surface
        style={[
          styles.episodeCard,
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
            styles.episodeThumb,
            { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[50] },
          ]}
        >
          <Play
            size={20}
            color={isDark ? Palette.primary[300] : Palette.primary[500]}
            fill={isDark ? Palette.primary[300] : Palette.primary[500]}
          />
        </View>
        <View style={styles.episodeInfo}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={{ color: theme.colors.onSurface }}
          >
            {item.title}
          </Text>
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {item.podcast?.title || 'Podcast'}
          </Text>
          <View style={styles.episodeMeta}>
            <Clock size={12} color={theme.colors.onSurfaceVariant} />
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}
            >
              {item.duration
                ? `${Math.floor(item.duration / 60)} min`
                : 'Unknown'}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
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
                <Surface
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: isDark
                        ? Palette.dark.surfaceVariant
                        : Palette.light.surfaceVariant,
                    },
                  ]}
                  elevation={0}
                >
                  <Headphones
                    size={32}
                    color={theme.colors.onSurfaceVariant}
                    strokeWidth={1}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: Spacing.sm,
                    }}
                  >
                    No podcasts yet. Be the first!
                  </Text>
                </Surface>
              )}
            </View>

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
                <Surface
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: isDark
                        ? Palette.dark.surfaceVariant
                        : Palette.light.surfaceVariant,
                    },
                  ]}
                  elevation={0}
                >
                  <Play
                    size={32}
                    color={theme.colors.onSurfaceVariant}
                    strokeWidth={1}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: Spacing.sm,
                    }}
                  >
                    No episodes yet
                  </Text>
                </Surface>
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
  // ── Podcast card ──
  podcastCard: {
    width: PODCAST_CARD_WIDTH,
  },
  podcastCardInner: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  podcastCover: {
    width: '100%',
    height: PODCAST_CARD_WIDTH - 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  podcastTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  // ── Episode card ──
  episodeList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  episodeCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  episodeThumb: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  episodeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  // ── Empty state ──
  emptyState: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
