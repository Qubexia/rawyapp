/**
 * Podcast detail screen — modern / refreshed UI
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  IconButton,
  useTheme,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Headphones,
  UserPlus,
  UserCheck,
  Edit2,
  Trash2,
  RefreshCw,
  Globe,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react-native';

import { EpisodeRow, EmptyState, ConfirmDialog } from '@/components/ui';
import { usePodcast, useResolvePodcast } from '@/hooks/queries/use-podcasts';
import { resolveImageUrl } from '@/utils/url';
import { useEpisodes, useDeleteEpisode } from '@/hooks/queries/use-episodes';
import { useFollowStatus, useToggleFollow } from '@/hooks/queries/use-follows';
import { useSubscribeToPodcast, useUnsubscribeToPodcast } from '@/hooks/queries/use-subscriptions';
import { useSyncPodcast } from '@/hooks/queries/use-sync';
import { useMe } from '@/hooks/queries/use-users';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';

import type { Episode } from '@/services/episodes.service';

export default function PodcastDetailScreen() {
  const { 
    id, 
    isAppleId,
    title: paramTitle,
    author: paramAuthor,
    artworkUrl: paramArtworkUrl,
  } = useLocalSearchParams<{ 
    id: string; 
    isAppleId?: string;
    title?: string;
    author?: string;
    artworkUrl?: string;
  }>();
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useAuthContext();
  const deleteEpisode = useDeleteEpisode();
  const isCompactLayout = width < 380;

  const {
    data: resolvedPodcast,
    isLoading: resolving,
    isError: resolveError,
  } = useResolvePodcast(id, { enabled: isAppleId === 'true' });

  const internalId = (isAppleId === 'true' ? resolvedPodcast?._id : id) || '';

  const {
    data: podcast,
    isLoading: podcastLoading,
    isError: podcastError,
    refetch: refetchPodcast,
  } = usePodcast(internalId, { enabled: !!internalId });
  const {
    data: episodesData,
    isLoading: episodesLoading,
    refetch: refetchEpisodes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEpisodes(internalId, undefined, { enabled: !!internalId && !podcastError });
  const { data: followStatus, refetch: refetchFollowStatus } = useFollowStatus(
    podcast?.creator?._id || '',
  );
  const toggleFollow = useToggleFollow(podcast?.creator?._id || '');
  const subscribeMutation = useSubscribeToPodcast();
  const unsubscribeMutation = useUnsubscribeToPodcast();
  const syncMutation = useSyncPodcast();
  const { data: myProfile, refetch: refetchProfile } = useMe({ enabled: !!user });

  const isSubscribed = React.useMemo(() => {
    return myProfile?.subscriptions?.includes(podcast?._id || '') || false;
  }, [myProfile, podcast?._id]);

  const isOwnPodcast = React.useMemo(() => {
    if (!user?._id || !podcast?.creator) return false;
    const podcastCreatorId = podcast.creator._id || podcast.creator;
    return podcastCreatorId.toString() === user._id.toString();
  }, [podcast, user]);

  const episodes = episodesData?.pages.flatMap((p) => p.data) ?? [];

  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchPodcast(), refetchEpisodes(), refetchFollowStatus()]);
    setRefreshing(false);
  }, [refetchPodcast, refetchEpisodes, refetchFollowStatus]);

  React.useEffect(() => {
    if (!internalId) return;
    refetchEpisodes();
  }, [internalId, refetchEpisodes]);

  useFocusEffect(
    useCallback(() => {
      if (!internalId) return;
      refetchEpisodes();
    }, [internalId, refetchEpisodes]),
  );

  const shouldPollForExternalEpisodes = React.useMemo(() => {
    if (!internalId || !podcast || podcast.source !== 'external') return false;
    if (episodes.length > 0) return false;
    return true;
  }, [internalId, podcast, episodes.length]);

  React.useEffect(() => {
    if (!shouldPollForExternalEpisodes) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;
    const pollDelayMs = 1800;
    let nextTimer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      await Promise.all([refetchPodcast(), refetchEpisodes()]);

      if (cancelled) return;

      if (attempts >= maxAttempts) {
        return;
      }

      nextTimer = setTimeout(poll, pollDelayMs);
    };

    nextTimer = setTimeout(poll, pollDelayMs);
    return () => {
      cancelled = true;
      if (nextTimer) {
        clearTimeout(nextTimer);
      }
    };
  }, [shouldPollForExternalEpisodes, refetchPodcast, refetchEpisodes]);

  const confirmDeleteEpisode = (episodeId: string, title: string) => {
    setDeleteDialog({ id: episodeId, title });
  };

  const handleDeleteEpisode = () => {
    if (deleteDialog) {
      deleteEpisode.mutate(deleteDialog.id);
    }
    setDeleteDialog(null);
  };

  if (resolving || podcastLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            variant="bodyMedium"
            style={{ marginTop: Spacing.sm, color: theme.colors.onSurfaceVariant }}
          >
            Loading podcast…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (resolveError || podcastError || !podcast) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.topBar}>
          <IconButton
            icon={() => <ArrowLeft size={22} color={theme.colors.onBackground} />}
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text
            variant="titleMedium"
            numberOfLines={1}
            style={[styles.navTitle, { color: theme.colors.onBackground }]}
          >
            Podcast
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={{ marginTop: Spacing.lg }}>
          <EmptyState
            icon={<Headphones size={32} color={theme.colors.onSurfaceVariant} strokeWidth={1} />}
            title="Podcast unavailable"
            message="This podcast could not be loaded. It may have been removed."
            isCard
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderEpisode = ({ item }: { item: Episode }) => (
    <View style={{ marginBottom: Spacing.sm, paddingHorizontal: Spacing.md }}>
      <EpisodeRow
        episode={item}
        showPodcastName={false}
        rightAction={
          isOwnPodcast ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton
                icon={() => (
                  <Edit2 size={18} color={theme.colors.onSurfaceVariant} />
                )}
                onPress={() =>
                  router.push(`/(creator)/edit-episode?id=${item._id}` as any)
                }
                size={20}
                style={{ margin: 0 }}
              />
              <IconButton
                icon={() => <Trash2 size={18} color={theme.colors.error} />}
                onPress={() => confirmDeleteEpisode(item._id, item.title)}
                size={20}
                style={{ margin: 0 }}
              />
            </View>
          ) : undefined
        }
      />
    </View>
  );

  const ListHeader = () => (
    <>
      {/* Hero / Cover section */}
      <View
        style={[
          styles.hero,
          {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          },
        ]}
      >
        <View
          style={[
            styles.heroContent,
            isCompactLayout && styles.heroContentCompact,
          ]}
        >
          <View
            style={[
              styles.coverWrapper,
              {
                shadowColor: Palette.black.pure,
              },
              isCompactLayout && styles.coverWrapperCompact,
            ]}
          >
            <Surface
              elevation={4}
              style={[
                styles.coverSurface,
                {
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              {(podcast?.coverImageUrl || paramArtworkUrl) ? (
                <Image
                  source={{ uri: resolveImageUrl(podcast?.coverImageUrl || paramArtworkUrl || '') }}
                  style={styles.coverImage}
                />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Headphones
                    size={48}
                    color={Palette.primary[500]}
                    strokeWidth={1.5}
                  />
                </View>
              )}
            </Surface>
          </View>

          {/* Main info card */}
          <View style={styles.infoCard}>
            <Text
              variant="headlineSmall"
              style={[
                styles.podcastTitle,
                { color: theme.colors.onBackground },
              ]}
              numberOfLines={2}
            >
              {podcast?.title || paramTitle}
            </Text>

            <TouchableOpacity
              onPress={() =>
                podcast?.creator?._id &&
                router.push(`/creator/${podcast.creator._id}` as any)
              }
              disabled={!podcast?.creator?._id}
            >
              <Text
                variant="titleSmall"
                style={[styles.creatorName, { color: theme.colors.primary }]}
                numberOfLines={1}
              >
                {podcast?.source === 'external' 
                  ? (podcast?.creator?.name || paramAuthor)
                  : (podcast?.creator?.name || 'Unknown Creator')}
              </Text>
            </TouchableOpacity>

            <View style={styles.metaRow}>
              <Text
                variant="labelMedium"
                style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                Podcast
              </Text>
              <View style={styles.dot} />
              <Text variant="labelMedium" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                {(podcast?.episodeCount || episodes.length) > 0 
                  ? `${podcast?.episodeCount || episodes.length} episodes`
                  : (podcast?.source === 'external' ? 'Syncing episodes...' : '0 episodes')}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              {!isOwnPodcast && (
                <Button
                  mode={followStatus?.isFollowing ? 'outlined' : 'contained'}
                  onPress={() => {
                    if (!user) {
                      router.push('/(auth)/login' as any);
                      return;
                    }
                    toggleFollow.mutate(followStatus?.isFollowing || false);
                  }}
                  loading={toggleFollow.isPending}
                  icon={() =>
                    followStatus?.isFollowing ? (
                      <UserCheck size={18} color={theme.colors.primary} />
                    ) : (
                      <UserPlus size={18} color={Palette.white.pure} />
                    )
                  }
                  style={[
                    styles.followButton,
                    isCompactLayout && styles.actionButtonCompact,
                  ]}
                  contentStyle={styles.followContent}
                  labelStyle={[styles.followLabel, { color: followStatus?.isFollowing ? theme.colors.primary : Palette.white.pure }]}
                >
                  {followStatus?.isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}

              {!isOwnPodcast && (
                <Button
                  mode={isSubscribed ? 'outlined' : 'contained'}
                  onPress={() => {
                    if (!user) {
                      router.push('/(auth)/login' as any);
                      return;
                    }
                    if (isSubscribed) {
                      unsubscribeMutation.mutate(podcast?._id || '', {
                        onSuccess: () => refetchProfile(),
                      });
                    } else {
                      subscribeMutation.mutate(podcast?._id || '', {
                        onSuccess: () => refetchProfile(),
                      });
                    }
                  }}
                  loading={subscribeMutation.isPending || unsubscribeMutation.isPending}
                  icon={() =>
                    isSubscribed ? (
                      <BookmarkCheck size={18} color={theme.colors.primary} />
                    ) : (
                      <Bookmark size={18} color={Palette.white.pure} />
                    )
                  }
                  style={[
                    styles.followButton,
                    isCompactLayout && styles.actionButtonCompact,
                    isSubscribed ? undefined : { backgroundColor: Palette.primary[500] },
                  ]}
                  contentStyle={styles.followContent}
                  labelStyle={[styles.followLabel, { color: isSubscribed ? theme.colors.primary : Palette.white.pure }]}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              )}

              {isOwnPodcast && (
                <Text
                  variant="labelMedium"
                  style={[
                    styles.ownerBadge,
                    { color: theme.colors.primary },
                  ]}
                >
                  Your podcast
                </Text>
              )}
            </View>

            {/* Source badge + Subscribe / Sync controls */}
            <View style={styles.sourceRow}>
              {podcast?.source === 'external' && (
                <View style={[styles.sourceBadge, { backgroundColor: Palette.primary[50] }]}>
                  <Globe size={12} color={Palette.primary[500]} />
                  <Text style={[styles.sourceBadgeText, { color: Palette.primary[600] }]}>External</Text>
                </View>
              )}
              {podcast?.source === 'internal' && (
                <View style={[styles.sourceBadge, { backgroundColor: '#F0F9FF' }]}>
                  <Headphones size={12} color={Palette.secondary[500]} />
                  <Text style={[styles.sourceBadgeText, { color: Palette.secondary[600] }]}>Rawy Original</Text>
                </View>
              )}

              {/* Sync button for owner of external podcasts */}
              {isOwnPodcast && podcast?.source === 'external' && (
                <TouchableOpacity
                  style={[styles.syncButton, { borderColor: theme.colors.outline }]}
                  onPress={() => syncMutation.mutate(podcast._id)}
                  disabled={syncMutation.isPending}
                >
                  <RefreshCw
                    size={14}
                    color={theme.colors.primary}
                    style={syncMutation.isPending ? { opacity: 0.5 } : undefined}
                  />
                  <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '600', marginLeft: 4 }}>
                    {syncMutation.isPending ? 'Syncing...' : 'Sync Now'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: Spacing.md }} />

      {/* Episodes header */}
      <View style={styles.episodesHeader}>
        <View style={styles.episodesHeaderRow}>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onBackground,
              fontWeight: '700',
            }}
          >
            Episodes
          </Text>
          {episodesLoading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ marginLeft: Spacing.xs }}
            />
          )}
        </View>
        <Text
          variant="labelMedium"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginTop: 2,
          }}
        >
          Latest episodes from this podcast
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: podcast?.coverImageUrl ? 'transparent' : theme.colors.background },
      ]}
    >
      {/* Dynamic Background Blur */}
      {podcast?.coverImageUrl && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Image
            source={{ uri: resolveImageUrl(podcast.coverImageUrl) }}
            style={StyleSheet.absoluteFill}
            blurRadius={80}
          />
          <View style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.dark ? 'rgba(26,26,46,0.85)' : 'rgba(248,249,252,0.85)' }
          ]} />
        </View>
      )}

      {/* Top nav / back */}
      <View style={styles.topBar}>
        <IconButton
          icon={() => (
            <ArrowLeft size={22} color={theme.colors.onBackground} />
          )}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text
          variant="titleMedium"
          numberOfLines={1}
          style={[styles.navTitle, { color: theme.colors.onBackground }]}
        >
          {podcast?.title || 'Podcast'}
        </Text>
        {/* Placeholder to center title */}
        <View style={{ width: 48 }} />
      </View>

      <FlatList
        data={episodes}
        keyExtractor={(item, index) =>
          item?._id ? String(item._id) : String(index)
        }
        renderItem={renderEpisode}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View style={{ paddingVertical: Spacing.md, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={() =>
          !episodesLoading ? (
            <View style={{ marginTop: Spacing.lg }}>
              <EmptyState
                icon={
                  <Headphones
                    size={32}
                    color={theme.colors.onSurfaceVariant}
                    strokeWidth={1}
                  />
                }
                message="No episodes yet"
              />
            </View>
          ) : null
        }
      />

      <ConfirmDialog
        visible={!!deleteDialog}
        title="Delete Episode"
        message={`Are you sure you want to delete "${deleteDialog?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onCancel={() => setDeleteDialog(null)}
        onConfirm={handleDeleteEpisode}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    margin: 0,
    marginRight: Spacing.xs,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero
  hero: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroContentCompact: {
    flexDirection: 'column',
  },
  coverWrapper: {
    marginRight: Spacing.lg,
  },
  coverWrapperCompact: {
    marginRight: 0,
    marginBottom: Spacing.md,
    alignSelf: 'center',
  },
  coverSurface: {
    width: 120,
    height: 120,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoCard: {
    flex: 1,
    minWidth: 0,
  },
  podcastTitle: {
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  creatorName: {
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metaText: {
    // color applied inline from theme
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: Spacing.xs,
    backgroundColor: '#D0D0D0',
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  followButton: {
    borderRadius: Radius.lg,
    minWidth: 132,
    flexGrow: 1,
    flexShrink: 1,
  },
  actionButtonCompact: {
    minWidth: '100%',
  },
  followContent: {
    height: 40,
  },
  followLabel: {
    fontWeight: '600',
  },
  ownerBadge: {
    marginLeft: Spacing.md,
    fontWeight: '600',
  },

  // Description
  descriptionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  descriptionText: {
    lineHeight: 22,
  },

  // Episodes
  episodesHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  episodesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  listContent: {
    paddingBottom: Spacing.xxl,
  },

  // Source & Sync
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    gap: 4,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
}) as any;
