/**
 * Podcast detail screen — shows podcast info, episodes list, follow button.
 */

import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  Button,
  IconButton,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Headphones,
  Play,
  Clock,
  UserPlus,
  UserCheck,
} from 'lucide-react-native';

import { usePodcast } from '@/hooks/queries/use-podcasts';
import { useEpisodes } from '@/hooks/queries/use-episodes';
import { useFollowStatus, useToggleFollow } from '@/hooks/queries/use-follows';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Episode } from '@/services/episodes.service';

export default function PodcastDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = false;
  const router = useRouter();
  const { user } = useAuthContext();

  const { data: podcast, isLoading: podcastLoading } = usePodcast(id);
  const { data: episodesData, isLoading: episodesLoading } = useEpisodes(id);
  const { data: followStatus } = useFollowStatus(
    podcast?.creator?._id || '',
  );
  const toggleFollow = useToggleFollow(podcast?.creator?._id || '');

  const isOwnPodcast = React.useMemo(() => {
    if (!user?._id || !podcast?.creator) return false;
    // podcast.creator._id is the User ID because it's populated from creatorId ref: 'User'
    const podcastCreatorId = podcast.creator._id || podcast.creator;
    return podcastCreatorId.toString() === user._id.toString();
  }, [podcast, user]);

  const episodes = episodesData?.pages.flatMap((p) => p.data) ?? [];

  if (podcastLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const renderEpisode = ({ item }: { item: Episode }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/episode/${item._id}` as any)}
    >
      <Surface
        style={[
          styles.episodeRow,
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
            styles.playIcon,
            {
              backgroundColor: isDark
                ? Palette.dark.elevated
                : Palette.primary[50],
            },
          ]}
        >
          <Play
            size={18}
            color={isDark ? Palette.primary[300] : Palette.primary[500]}
            fill={isDark ? Palette.primary[300] : Palette.primary[500]}
          />
        </View>
        <View style={styles.episodeInfo}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={{ color: theme.colors.onSurface, fontWeight: '600' }}
          >
            {item.title}
          </Text>
          <View style={styles.episodeMeta}>
            <Clock size={12} color={theme.colors.onSurfaceVariant} />
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginLeft: 4,
              }}
            >
              {item.duration
                ? `${Math.floor(item.duration / 60)} min`
                : '—'}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      {/* Hero */}
      <View
        style={[
          styles.hero,
          {
            backgroundColor: isDark
              ? Palette.dark.surfaceVariant
              : Palette.primary[50],
          },
        ]}
      >
        <View
          style={[
            styles.coverImage,
            {
              backgroundColor: isDark
                ? Palette.dark.elevated
                : Palette.primary[100],
            },
          ]}
        >
          <Headphones
            size={48}
            color={isDark ? Palette.primary[300] : Palette.primary[500]}
            strokeWidth={1.5}
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text
          variant="headlineSmall"
          style={[styles.podcastTitle, { color: theme.colors.onBackground }]}
        >
          {podcast?.title}
        </Text>

        <TouchableOpacity
          onPress={() =>
            podcast?.creator?._id &&
            router.push(`/creator/${podcast.creator._id}` as any)
          }
        >
          <Text
            variant="titleSmall"
            style={{ color: theme.colors.primary, fontWeight: '600' }}
          >
            {podcast?.creator?.name || 'Unknown Creator'}
          </Text>
        </TouchableOpacity>

        {podcast?.description && (
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: Spacing.sm,
              lineHeight: 22,
            }}
          >
            {podcast.description}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!isOwnPodcast && (
            <Button
              mode={followStatus?.isFollowing ? 'outlined' : 'contained'}
              onPress={() =>
                toggleFollow.mutate(followStatus?.isFollowing || false)
              }
              loading={toggleFollow.isPending}
              icon={() =>
                followStatus?.isFollowing ? (
                  <UserCheck size={18} color={theme.colors.primary} />
                ) : (
                  <UserPlus size={18} color="#FFFFFF" />
                )
              }
              style={styles.followButton}
              contentStyle={styles.followContent}
            >
              {followStatus?.isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
          <Text
            variant="labelMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginLeft: isOwnPodcast ? 0 : Spacing.md,
            }}
          >
            {podcast?.episodeCount || episodes.length} episodes
          </Text>
        </View>
      </View>

      {/* Episodes header */}
      <View style={styles.episodesHeader}>
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onBackground, fontWeight: '700' }}
        >
          Episodes
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Back button */}
      <View style={styles.topBar}>
        <IconButton
          icon={() => (
            <ArrowLeft size={24} color={theme.colors.onBackground} />
          )}
          onPress={() => router.back()}
        />
      </View>

      <FlatList
        data={episodes}
        keyExtractor={(item, index) => item?._id ? String(item._id) : String(index)}
        renderItem={renderEpisode}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() =>
          !episodesLoading ? (
            <View style={styles.emptyState}>
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
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
  },
  coverImage: {
    width: 140,
    height: 140,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  podcastTitle: {
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  followButton: {
    borderRadius: Radius.md,
  },
  followContent: {
    height: 40,
  },
  episodesHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  episodeRow: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  playIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
});
