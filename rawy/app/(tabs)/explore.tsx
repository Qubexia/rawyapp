/**
 * Explore screen — search podcasts, browse creators.
 * Redesigned with premium aesthetics, glassmorphism cards, and smooth animations.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Headphones,
  Users,
  Mic,
  Clock,
  X,
  TrendingUp,
  ChevronRight,
  Play,
  Sparkles,
} from 'lucide-react-native';

import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useCreators } from '@/hooks/queries/use-creators';
import { resolveImageUrl } from '@/utils/url';
import { Palette, Spacing, Radius } from '@/constants/theme';
import type { Podcast } from '@/services/podcasts.service';
import type { CreatorProfile } from '@/services/creators.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Sparkles size={14} color={Palette.white.pure} />,
  Technology: <Headphones size={14} color={Palette.white.pure} />,
  Business: <TrendingUp size={14} color={Palette.white.pure} />,
};

const DEBOUNCE_MS = 500;

export default function ExploreScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const searchScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(searchScale, {
        toValue: 1,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('searchHistory').then(res => {
      if (res) setSearchHistory(JSON.parse(res));
    });
  }, []);

  const saveSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const newHistory = [trimmed, ...searchHistory.filter(q => q !== trimmed)].slice(0, 10);
    setSearchHistory(newHistory);
    AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const removeHistoryItem = (query: string) => {
    const newHistory = searchHistory.filter(q => q !== query);
    setSearchHistory(newHistory);
    AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };
  
  const clearHistory = () => {
    setSearchHistory([]);
    AsyncStorage.removeItem('searchHistory');
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const {
    data: podcastsData,
    isLoading: podcastsLoading,
    refetch: refetchPodcasts,
  } = usePodcasts({
    search: debouncedSearch || undefined,
    category: activeCategory === 'All' ? undefined : activeCategory,
  });

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

  const isLoading = podcastsLoading || creatorsLoading;

  // ─── Podcast Card (Grid style) ─────────────────────────────────────────────
  const renderPodcastGridItem = ({ item, index }: { item: Podcast; index: number }) => {
    const coverUri = resolveImageUrl(item.coverImageUrl);
    const isEven = index % 2 === 0;
    
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/podcast/${item._id}` as any)}
        accessibilityLabel={`View podcast: ${item.title}`}
        accessibilityRole="link"
        style={[
          styles.podcastGridItem,
          { marginRight: isEven ? Spacing.sm : 0, marginLeft: isEven ? 0 : Spacing.sm },
        ]}
      >
        <Surface
          style={styles.podcastGridCard}
          elevation={2}
        >
          {/* Cover Image */}
          <View style={styles.podcastGridCover}>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                style={styles.podcastGridCoverImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#1F2937', '#374151']}
                style={styles.podcastGridPlaceholder}
              >
                <Headphones
                  size={28}
                  color="rgba(255,255,255,0.4)"
                  strokeWidth={1.5}
                />
              </LinearGradient>
            )}
            {/* Episode count badge */}
            <View style={styles.episodeBadge}>
              <Play size={8} color={Palette.white.pure} />
              <Text style={styles.episodeBadgeText}>
                {item.episodeCount || 0}
              </Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.podcastGridInfo}>
            <Text
              variant="titleSmall"
              numberOfLines={2}
              style={styles.podcastGridTitle}
            >
              {item.title}
            </Text>
            <View style={styles.podcastGridCreator}>
              <View style={styles.podcastGridCreatorDot} />
              <Text
                variant="labelSmall"
                numberOfLines={1}
                style={styles.podcastGridCreatorName}
              >
                {item.creator?.name || 'Unknown'}
              </Text>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  // ─── Featured Podcast (large card at top) ──────────────────────────────────
  const renderFeaturedPodcast = () => {
    if (podcasts.length === 0) return null;
    const featured = podcasts[0];
    const coverUri = resolveImageUrl(featured.coverImageUrl);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/podcast/${featured._id}` as any)}
        style={styles.featuredContainer}
      >
        <Surface style={styles.featuredCard} elevation={3}>
          <View style={styles.featuredImageContainer}>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#111827', '#1F2937', '#374151']}
                style={styles.featuredImage}
              >
                <Headphones size={48} color="rgba(255,255,255,0.3)" strokeWidth={1} />
              </LinearGradient>
            )}
            {/* Overlay gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.featuredOverlay}
            >
              <View style={styles.featuredBadge}>
                <TrendingUp size={12} color={Palette.white.pure} />
                <Text style={styles.featuredBadgeText}>Trending</Text>
              </View>
              <Text variant="titleLarge" style={styles.featuredTitle} numberOfLines={2}>
                {featured.title}
              </Text>
              <Text variant="bodySmall" style={styles.featuredCreator} numberOfLines={1}>
                by {featured.creator?.name || 'Unknown'} · {featured.episodeCount || 0} episodes
              </Text>
            </LinearGradient>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  // ─── Creator Card (redesigned) ─────────────────────────────────────────────
  const renderCreatorCard = ({ item }: { item: CreatorProfile }) => {
    const avatarUri = resolveImageUrl(item.avatarUrl);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/creator/${item._id}` as any)}
        accessibilityLabel={`View creator: ${item.showName || item.name}`}
        accessibilityRole="link"
      >
        <Surface style={styles.creatorCard} elevation={1}>
          <View style={styles.creatorAvatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.creatorAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={['#374151', '#1F2937']}
                style={styles.creatorAvatarPlaceholder}
              >
                <Mic size={20} color="rgba(255,255,255,0.5)" />
              </LinearGradient>
            )}
          </View>
          <Text
            variant="labelLarge"
            numberOfLines={1}
            style={styles.creatorName}
          >
            {item.name}
          </Text>
          <View style={styles.creatorStats}>
            <Users size={11} color={Palette.text.lightTertiary} />
            <Text style={styles.creatorFollowers}>
              {item.followerCount || 0}
            </Text>
          </View>
        </Surface>
      </TouchableOpacity>
    );
  };

  // ─── Search History ────────────────────────────────────────────────────────
  const renderSearchHistory = () => (
    <View style={styles.historyContainer}>
      <View style={styles.historyHeader}>
        <View style={styles.historyHeaderLeft}>
          <Clock size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="titleMedium" style={styles.historyTitle}>
            Recent Searches
          </Text>
        </View>
        {searchHistory.length > 0 && (
          <TouchableOpacity 
            onPress={clearHistory}
            accessibilityLabel="Clear search history"
            accessibilityRole="button"
            style={styles.clearButton}
          >
            <Text variant="labelMedium" style={[styles.clearButtonText, { color: theme.colors.primary }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {searchHistory.map((h, i) => (
        <TouchableOpacity
          key={i}
          style={styles.historyRow}
          onPress={() => {
            setSearchQuery(h);
            setIsSearchFocused(false);
            saveSearch(h);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.historyContent}>
            <View style={styles.historyIconCircle}>
              <Clock size={14} color={Palette.text.lightTertiary} />
            </View>
            <Text style={styles.historyText}>{h}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => removeHistoryItem(h)} 
            style={styles.historyRemoveBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={Palette.text.lightTertiary} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
      {searchHistory.length === 0 && (
        <View style={styles.emptyHistoryContainer}>
          <Search size={32} color={Palette.text.lightTertiary} strokeWidth={1} />
          <Text style={styles.emptyHistoryText}>No recent searches</Text>
          <Text style={styles.emptyHistorySubtext}>Your search history will appear here</Text>
        </View>
      )}
    </View>
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
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Explore
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Discover new podcasts & creators
          </Text>
        </Animated.View>

        {/* Search bar */}
        <Animated.View style={[styles.searchContainer, { transform: [{ scale: searchScale }] }]}>
          <Searchbar
            placeholder="Search podcasts, creators..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onSubmitEditing={() => {
              setIsSearchFocused(false);
              saveSearch(searchQuery);
            }}
            onIconPress={() => {
              if (isSearchFocused) {
                setIsSearchFocused(false);
                setSearchQuery('');
              }
            }}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            icon={() => (
              <Search
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            )}
          />
        </Animated.View>

        {isSearchFocused ? (
          renderSearchHistory()
        ) : (
          <>
            {/* Categories — Pill-style with active gradient */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {CATEGORIES.map((cat, idx) => {
                const isActive = activeCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat || idx}
                    onPress={() => setActiveCategory(cat)}
                    activeOpacity={0.8}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={['#111827', '#374151']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.categoryPill}
                      >
                        <Text style={styles.categoryTextActive}>{cat}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.categoryPill, styles.categoryPillInactive]}>
                        <Text style={styles.categoryTextInactive}>{cat}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.loadingText}>
                  Finding great podcasts...
                </Text>
              </View>
            ) : (
              <>
                {/* Featured Podcast */}
                {!debouncedSearch && activeCategory === 'All' && renderFeaturedPodcast()}

                {/* Creators */}
                {creators.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionHeaderLeft}>
                        <View style={styles.sectionIconBg}>
                          <Users size={14} color={Palette.white.pure} />
                        </View>
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
                      <ChevronRight size={18} color={Palette.text.lightTertiary} />
                    </View>
                    <FlatList
                      horizontal
                      data={creators}
                      keyExtractor={(item, index) => item?._id ? String(item._id) : String(index)}
                      renderItem={renderCreatorCard}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalList}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={5}
                      windowSize={5}
                    />
                  </View>
                )}

                {/* Podcasts Grid */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionHeaderLeft}>
                      <View style={styles.sectionIconBg}>
                        <Headphones size={14} color={Palette.white.pure} />
                      </View>
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.sectionTitle,
                          { color: theme.colors.onBackground },
                        ]}
                      >
                        {debouncedSearch || activeCategory !== 'All'
                          ? 'Search Results'
                          : 'All Podcasts'}
                      </Text>
                    </View>
                    <Text variant="labelMedium" style={styles.podcastCount}>
                      {podcasts.length} {podcasts.length === 1 ? 'podcast' : 'podcasts'}
                    </Text>
                  </View>

                  {podcasts.length > 0 ? (
                    <View style={styles.podcastGrid}>
                      {/* Skip first if featured is shown */}
                      {(debouncedSearch || activeCategory !== 'All' ? podcasts : podcasts.slice(1)).map((podcast, idx) => (
                        <View 
                          key={podcast?._id || idx}
                          style={styles.podcastGridItemWrapper}
                        >
                          {renderPodcastGridItem({ item: podcast, index: idx })}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Surface style={styles.emptyState} elevation={0}>
                      <View style={styles.emptyStateIcon}>
                        <Search
                          size={36}
                          color={Palette.text.lightTertiary}
                          strokeWidth={1}
                        />
                      </View>
                      <Text variant="titleSmall" style={styles.emptyStateTitle}>
                        No podcasts found
                      </Text>
                      <Text variant="bodySmall" style={styles.emptyStateSubtitle}>
                        Try a different search or category
                      </Text>
                    </Surface>
                  )}
                </View>
              </>
            )}
          </>
        )}

        <View style={{ height: Spacing.xxl + Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ─── Header ────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 2,
    opacity: 0.7,
  },

  // ─── Search ────────────────────────────────────────────────────────────────
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  searchbar: {
    borderRadius: Radius.xl,
    backgroundColor: Palette.light.surfaceVariant,
    elevation: 0,
  },
  searchInput: {
    fontSize: 15,
  },

  // ─── Categories ────────────────────────────────────────────────────────────
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryPillInactive: {
    backgroundColor: Palette.light.surfaceVariant,
    borderWidth: 1,
    borderColor: Palette.light.border,
  },
  categoryTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.white.pure,
    letterSpacing: 0.2,
  },
  categoryTextInactive: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.text.lightSecondary,
  },

  // ─── Featured Podcast ─────────────────────────────────────────────────────
  featuredContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  featuredCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Palette.light.surface,
  },
  featuredImageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  featuredBadgeText: {
    color: Palette.white.pure,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: Palette.white.pure,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  featuredCreator: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  // ─── Section ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    marginLeft: Spacing.sm,
    letterSpacing: -0.2,
  },

  // ─── Creators ──────────────────────────────────────────────────────────────
  horizontalList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  creatorCard: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    width: 120,
    backgroundColor: Palette.light.surface,
  },
  creatorAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Palette.light.border,
  },
  creatorAvatarImage: {
    width: '100%',
    height: '100%',
  },
  creatorAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorName: {
    fontWeight: '700',
    color: Palette.text.lightPrimary,
    textAlign: 'center',
    maxWidth: 100,
    marginBottom: 4,
  },
  creatorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creatorFollowers: {
    fontSize: 11,
    color: Palette.text.lightTertiary,
    fontWeight: '600',
  },

  // ─── Podcast Grid ──────────────────────────────────────────────────────────
  podcastCount: {
    color: Palette.text.lightTertiary,
    fontWeight: '500',
  },
  podcastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
  },
  podcastGridItemWrapper: {
    width: '50%',
    marginBottom: Spacing.md,
  },
  podcastGridItem: {
    flex: 1,
  },
  podcastGridCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Palette.light.surface,
  },
  podcastGridCover: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  podcastGridCoverImage: {
    width: '100%',
    height: '100%',
  },
  podcastGridPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  episodeBadgeText: {
    color: Palette.white.pure,
    fontSize: 10,
    fontWeight: '700',
  },
  podcastGridInfo: {
    padding: Spacing.sm + 2,
  },
  podcastGridTitle: {
    fontWeight: '700',
    color: Palette.text.lightPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  podcastGridCreator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  podcastGridCreatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.text.lightTertiary,
    marginRight: 6,
  },
  podcastGridCreatorName: {
    color: Palette.text.lightTertiary,
    fontWeight: '500',
  },

  // ─── Empty State ───────────────────────────────────────────────────────────
  emptyState: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xxl + Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.light.surfaceVariant,
  },
  emptyStateIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Palette.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    color: Palette.text.lightPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    color: Palette.text.lightTertiary,
  },

  // ─── Loading ───────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  loadingText: {
    color: Palette.text.lightTertiary,
    marginTop: Spacing.md,
  },

  // ─── Search History ────────────────────────────────────────────────────────
  historyContainer: {
    paddingHorizontal: Spacing.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  historyTitle: {
    fontWeight: '700',
    color: Palette.text.lightPrimary,
  },
  clearButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  clearButtonText: {
    fontWeight: '700',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.light.border,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.light.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  historyText: {
    fontSize: 15,
    color: Palette.text.lightPrimary,
    fontWeight: '500',
  },
  historyRemoveBtn: {
    padding: Spacing.xs,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyHistoryText: {
    color: Palette.text.lightSecondary,
    fontWeight: '600',
    marginTop: Spacing.md,
    fontSize: 15,
  },
  emptyHistorySubtext: {
    color: Palette.text.lightTertiary,
    marginTop: 4,
    fontSize: 13,
  },
});
