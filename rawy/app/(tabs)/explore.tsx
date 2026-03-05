/**
 * Explore screen — search podcasts, browse creators.
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
  Searchbar,
  Surface,
  Chip,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import {
  Search,
  Headphones,
  Users,
  Mic,
} from 'lucide-react-native';

import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useCreators } from '@/hooks/queries/use-creators';
import { Palette, Spacing, Radius } from '@/constants/theme';
import type { Podcast } from '@/services/podcasts.service';
import type { CreatorProfile } from '@/services/creators.service';

const CATEGORIES = [
  'All',
  'Technology',
  'Business',
  'Comedy',
  'Education',
  'Health',
  'Science',
  'Culture',
  'Sports',
];

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const {
    data: podcastsData,
    isLoading: podcastsLoading,
    refetch: refetchPodcasts,
  } = usePodcasts();

  const {
    data: creatorsData,
    isLoading: creatorsLoading,
    refetch: refetchCreators,
  } = useCreators();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchPodcasts(), refetchCreators()]);
    setRefreshing(false);
  }, [refetchPodcasts, refetchCreators]);

  const podcasts = podcastsData?.pages.flatMap((p) => p.data) ?? [];
  const creators = creatorsData?.pages.flatMap((p) => p.data) ?? [];

  // Filter by search query
  const filteredPodcasts = searchQuery
    ? podcasts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : podcasts;

  const isLoading = podcastsLoading || creatorsLoading;

  const renderPodcastRow = ({ item }: { item: Podcast }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/podcast/${item._id}` as any)}
    >
      <Surface
        style={[
          styles.podcastRow,
          {
            backgroundColor: Palette.light.surface,
          },
        ]}
        elevation={1}
      >
        <View
          style={[
            styles.podcastIcon,
            {
              backgroundColor: Palette.primary[50],
            },
          ]}
        >
          <Headphones
            size={22}
            color={Palette.primary[500]}
            strokeWidth={1.5}
          />
        </View>
        <View style={styles.podcastInfo}>
          <Text
            variant="titleSmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurface, fontWeight: '600' }}
          >
            {item.title}
          </Text>
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {item.creator?.name || 'Unknown'} · {item.episodeCount || 0}{' '}
            episodes
          </Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderCreatorChip = ({ item }: { item: CreatorProfile }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/creator/${item._id}` as any)}
    >
      <Surface
        style={[
          styles.creatorChip,
          {
            backgroundColor: Palette.light.surfaceVariant,
          },
        ]}
        elevation={0}
      >
        <View
          style={[
            styles.creatorAvatar,
            {
              backgroundColor: Palette.primary[100],
            },
          ]}
        >
          <Mic
            size={16}
            color={Palette.primary[500]}
          />
        </View>
        <Text
          variant="labelMedium"
          numberOfLines={1}
          style={{
            color: theme.colors.onSurface,
            fontWeight: '600',
            maxWidth: 80,
          }}
        >
          {item.name}
        </Text>
        <Text
          variant="labelSmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {item.followerCount || 0} followers
        </Text>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
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
        {/* Header */}
        <View style={styles.header}>
          <Text
            variant="headlineSmall"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Explore
          </Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search podcasts, creators..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchbar,
              {
                backgroundColor: Palette.light.surfaceVariant,
              },
            ]}
            inputStyle={styles.searchInput}
            icon={() => (
              <Search
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            )}
            elevation={0}
          />
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat, idx) => (
            <Chip
              key={cat || idx}
              selected={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryChip,
                activeCategory === cat && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              textStyle={[
                styles.categoryText,
                activeCategory === cat && { color: '#FFFFFF' },
              ]}
              mode="flat"
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {/* Creators */}
            {creators.length > 0 && (
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
                    Popular Creators
                  </Text>
                </View>
                <FlatList
                  horizontal
                  data={creators}
                  keyExtractor={(item, index) => item?._id ? String(item._id) : String(index)}
                  renderItem={renderCreatorChip}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                />
              </View>
            )}

            {/* Podcasts */}
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
                  {searchQuery ? 'Search Results' : 'All Podcasts'}
                </Text>
              </View>
              {filteredPodcasts.length > 0 ? (
                <View style={styles.podcastList}>
                  {filteredPodcasts.map((podcast, idx) => (
                    <View key={podcast?._id || idx} style={{ width: '48%', marginBottom: Spacing.md }}>
                      {renderPodcastRow({ item: podcast })}
                    </View>
                  ))}
                </View>
              ) : (
                <Surface
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: Palette.light.surfaceVariant,
                    },
                  ]}
                  elevation={0}
                >
                  <Search
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
                    {searchQuery
                      ? 'No results found'
                      : 'No podcasts available'}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchbar: {
    borderRadius: Radius.lg,
  },
  searchInput: {
    fontSize: 15,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    borderRadius: Radius.full,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
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
  // ── Creator chip ──
  creatorChip: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    width: 110,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  // ── Podcast row ──
  podcastList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  podcastRow: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  podcastIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  podcastInfo: {
    flex: 1,
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
