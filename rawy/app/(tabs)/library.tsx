/**
 * Library tab — liked episodes, followed creators.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  SegmentedButtons,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import {
  Heart,
  Users,
  Library as LibraryIcon,
} from 'lucide-react-native';

import {
  EpisodeRow,
  CreatorChip,
  EmptyState,
} from '@/components/ui';
import { useFollowing } from '@/hooks/queries/use-follows';
import { useLikedEpisodes } from '@/hooks/queries/use-likes';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthContext } from '@/context/auth-context';
import type { Episode } from '@/services/episodes.service';
import type { FollowedCreator } from '@/services/follows.service';

export default function LibraryScreen() {
  const theme = useTheme();
  const { isAuthenticated } = useAuthContext();

  const [segment, setSegment] = useState('episodes');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: followingData,
    isLoading: followingLoading,
    refetch: refetchFollowing,
  } = useFollowing();

  const {
    data: episodesData,
    isLoading: episodesLoading,
    refetch: refetchEpisodes,
  } = useLikedEpisodes();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFollowing(), refetchEpisodes()]);
    setRefreshing(false);
  }, [refetchFollowing, refetchEpisodes]);

  const following = followingData?.pages.flatMap((p) => p.data) ?? [];
  const episodes = episodesData?.data ?? [];

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.authPrompt}>
          <EmptyState
            icon={
              <LibraryIcon
                size={48}
                color={theme.colors.onSurfaceVariant}
                strokeWidth={1}
              />
            }
            title="Sign in to see your library"
            message="Your liked episodes and followed creators will appear here."
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderEpisodeRow = ({ item }: { item: Episode }) => (
    <EpisodeRow episode={item} />
  );

  const renderCreatorRow = ({ item }: { item: FollowedCreator }) => (
    <CreatorChip creator={item} />
  );

  const isLoading = followingLoading || episodesLoading;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Your Library
        </Text>
      </View>

      {/* Segment */}
      <View style={styles.segmentContainer}>
        <SegmentedButtons
          value={segment}
          onValueChange={setSegment}
          buttons={[
            {
              value: 'episodes',
              label: 'Episodes',
              icon: () => (
                <Heart size={16} color={theme.colors.onSurface} />
              ),
            },
            {
              value: 'following',
              label: 'Following',
              icon: () => (
                <Users size={16} color={theme.colors.onSurface} />
              ),
            },
          ]}
          style={styles.segmentButtons}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={(segment === 'episodes' ? episodes : following) as any[]}
          keyExtractor={(item: any, index) => item?._id ? String(item._id) : String(index)}
          renderItem={
            segment === 'episodes'
              ? (renderEpisodeRow as any)
              : (renderCreatorRow as any)
          }
          contentContainerStyle={styles.listContent}
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
                segment === 'episodes' ? (
                  <Heart
                    size={32}
                    color={theme.colors.onSurfaceVariant}
                    strokeWidth={1}
                  />
                ) : (
                  <Users
                    size={32}
                    color={theme.colors.onSurfaceVariant}
                    strokeWidth={1}
                  />
                )
              }
              message={
                segment === 'episodes'
                  ? 'No liked episodes yet'
                  : 'Not following anyone yet'
              }
            />
          )}
        />
      )}
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
    paddingBottom: Spacing.sm,
  },
  title: {
    fontWeight: '700',
  },
  segmentContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  segmentButtons: {
    borderRadius: Radius.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
