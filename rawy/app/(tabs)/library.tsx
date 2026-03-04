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
import { useRouter } from 'expo-router';
import {
  Heart,
  Users,
  Play,
  Clock,
  Mic,
  Library as LibraryIcon,
} from 'lucide-react-native';

import { useFollowing } from '@/hooks/queries/use-follows';
import { useEpisodes } from '@/hooks/queries/use-episodes';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthContext } from '@/context/auth-context';
import type { Episode } from '@/services/episodes.service';
import type { FollowedCreator } from '@/services/follows.service';

export default function LibraryScreen() {
  const theme = useTheme();
  const isDark = false;
  const router = useRouter();
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
  } = useEpisodes();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFollowing(), refetchEpisodes()]);
    setRefreshing(false);
  }, [refetchFollowing, refetchEpisodes]);

  const following = followingData?.pages.flatMap((p) => p.data) ?? [];
  const episodes = episodesData?.pages.flatMap((p) => p.data) ?? [];

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.authPrompt}>
          <LibraryIcon
            size={48}
            color={theme.colors.onSurfaceVariant}
            strokeWidth={1}
          />
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onSurface,
              marginTop: Spacing.md,
              fontWeight: '600',
            }}
          >
            Sign in to see your library
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: Spacing.xs,
              textAlign: 'center',
            }}
          >
            Your liked episodes and followed creators will appear here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderEpisodeRow = ({ item }: { item: Episode }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/episode/${item._id}` as any)}
    >
      <Surface
        style={[
          styles.row,
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
            styles.rowIcon,
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
        <View style={styles.rowInfo}>
          <Text
            variant="titleSmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurface, fontWeight: '600' }}
          >
            {item.title}
          </Text>
          <View style={styles.rowMeta}>
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
                : 'Unknown'}
            </Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderCreatorRow = ({ item }: { item: FollowedCreator }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/creator/${item._id}` as any)}
    >
      <Surface
        style={[
          styles.row,
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
            styles.creatorAvatar,
            {
              backgroundColor: isDark
                ? Palette.dark.elevated
                : Palette.primary[100],
            },
          ]}
        >
          <Mic
            size={18}
            color={isDark ? Palette.primary[300] : Palette.primary[500]}
          />
        </View>
        <View style={styles.rowInfo}>
          <Text
            variant="titleSmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurface, fontWeight: '600' }}
          >
            {item.name}
          </Text>
          {item.showName && (
            <Text
              variant="bodySmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {item.showName}
            </Text>
          )}
        </View>
      </Surface>
    </TouchableOpacity>
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
            <View style={styles.emptyState}>
              {segment === 'episodes' ? (
                <>
                  <Heart
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
                    No liked episodes yet
                  </Text>
                </>
              ) : (
                <>
                  <Users
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
                    Not following anyone yet
                  </Text>
                </>
              )}
            </View>
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
  row: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rowInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
