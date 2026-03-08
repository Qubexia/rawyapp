/**
 * Library tab — liked episodes, followed creators.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Surface,
  SegmentedButtons,
  useTheme,
  ActivityIndicator,
  IconButton,
  Button,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import {
  Heart,
  Users,
  Library as LibraryIcon,
  Mic,
  UserMinus,
  Compass,
} from 'lucide-react-native';

import {
  EpisodeRow,
  EmptyState,
} from '@/components/ui';
import { useFollowing, useToggleFollow } from '@/hooks/queries/use-follows';
import { useLikedEpisodes } from '@/hooks/queries/use-likes';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { resolveImageUrl } from '@/utils/url';
import type { Episode } from '@/services/episodes.service';
import type { FollowedCreator } from '@/services/follows.service';

function FollowingCreatorRow({ creator }: { creator: FollowedCreator }) {
  const theme = useTheme();
  const router = useRouter();
  const targetId = creator.userId ?? creator._id;
  const toggleFollow = useToggleFollow(targetId);
  const avatarUri = resolveImageUrl(creator.avatarUrl ?? creator.avatar);

  const handleRowPress = () => {
    router.push(`/creator/${creator._id}` as any);
  };

  const handleUnfollowPress = (e: any) => {
    e.stopPropagation();
    Alert.alert(
      'Unfollow',
      `Unfollow ${creator.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unfollow',
          style: 'destructive',
          onPress: () => toggleFollow.mutate(true),
        },
      ],
    );
  };

  return (
    <Surface
      style={[styles.creatorRow, { backgroundColor: Palette.light.surface }]}
      elevation={1}
    >
      <Pressable
        onPress={handleRowPress}
        style={({ pressed }) => [
          styles.creatorRowContent,
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: Palette.primary[100] }]}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          ) : (
            <Mic size={20} color={Palette.primary[500]} />
          )}
        </View>
        <View style={styles.creatorInfo}>
          <Text
            variant="titleSmall"
            numberOfLines={1}
            style={[styles.creatorName, { color: theme.colors.onSurface }]}
          >
            {creator.name}
          </Text>
          {creator.showName && (
            <Text
              variant="bodySmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {creator.showName}
            </Text>
          )}
        </View>
        <IconButton
          icon={() => <UserMinus size={20} color={theme.colors.onSurfaceVariant} />}
          onPress={handleUnfollowPress}
          size={20}
          style={styles.unfollowButton}
        />
      </Pressable>
    </Surface>
  );
}

export default function LibraryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();

  const [segment, setSegment] = useState('episodes');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: followingData,
    isLoading: followingLoading,
    refetch: refetchFollowing,
  } = useFollowing({ enabled: isAuthenticated });

  const {
    data: episodesData,
    isLoading: episodesLoading,
    refetch: refetchEpisodes,
  } = useLikedEpisodes({ enabled: isAuthenticated });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchFollowing(), refetchEpisodes()]);
    setRefreshing(false);
  }, [refetchFollowing, refetchEpisodes]);

  const following = followingData?.pages.flatMap((p) => p.data) ?? [];
  const episodes = episodesData?.data ?? [];

  const renderEpisodeRow = ({ item }: { item: Episode }) => (
    <EpisodeRow episode={item} />
  );

  const renderCreatorRow = ({ item }: { item: FollowedCreator }) => (
    <FollowingCreatorRow creator={item} />
  );

  const isLoading = followingLoading || episodesLoading;

  const showAuthPrompt = !isAuthenticated && segment === 'following';
  const showEpisodesAuthPrompt = !isAuthenticated && segment === 'episodes';

  const listContent = () => {
    if (showAuthPrompt) {
      return (
        <View style={styles.authPrompt}>
          <EmptyState
            icon={
              <Users
                size={48}
                color={theme.colors.onSurfaceVariant}
                strokeWidth={1}
              />
            }
            title="Sign in to see who you're following"
            message="Your followed creators will appear here once you sign in."
          />
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInButton}
          >
            Sign In
          </Button>
        </View>
      );
    }

    if (showEpisodesAuthPrompt) {
      return (
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
          <Button
            mode="contained"
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInButton}
          >
            Sign In
          </Button>
        </View>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    const data = segment === 'episodes' ? episodes : following;
    const isEmpty = Array.isArray(data) && data.length === 0;

    if (segment === 'following' && isEmpty) {
      return (
        <View style={styles.emptyFollowing}>
          <EmptyState
            icon={
              <Users
                size={48}
                color={theme.colors.onSurfaceVariant}
                strokeWidth={1}
              />
            }
            title="You're not following anyone yet"
            message="Discover creators on the Explore tab and follow your favorites."
          />
          <Button
            mode="outlined"
            onPress={() => router.push('/(tabs)/explore')}
            icon={() => <Compass size={18} color={theme.colors.primary} />}
            style={styles.exploreButton}
          >
            Explore
          </Button>
        </View>
      );
    }

    return (
      <FlatList
        data={data as any[]}
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
        ListEmptyComponent={() =>
          segment === 'episodes' ? (
            <EmptyState
              icon={
                <Heart
                  size={32}
                  color={theme.colors.onSurfaceVariant}
                  strokeWidth={1}
                />
              }
              message="No liked episodes yet"
            />
          ) : null
        }
      />
    );
  };

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

      {listContent()}
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
  signInButton: {
    marginTop: Spacing.lg,
  },
  creatorRow: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  creatorRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  creatorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  creatorName: {
    fontWeight: '600',
  },
  unfollowButton: {
    margin: 0,
  },
  emptyFollowing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  exploreButton: {
    marginTop: Spacing.lg,
  },
});
