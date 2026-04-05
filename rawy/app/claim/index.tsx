import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Searchbar, Surface, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ShieldCheck, Search, Headphones, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useSearchExternalPodcasts } from '@/hooks/queries/use-discover';
import { Palette, Spacing, Radius } from '@/constants/theme';
import type { DiscoverPodcast } from '@/services/discover.service';

export default function ClaimPodcastScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useSearchExternalPodcasts(debouncedSearch);

  const renderResult = ({ item }: { item: DiscoverPodcast }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: `/claim/${item.appleId || item.id}` as any,
          params: {
            title: item.title,
            author: item.author,
            artworkUrl: item.artworkUrl,
          },
        });
      }}
      style={styles.cardContainer}
    >
      <Surface style={styles.card} elevation={1}>
        {item.artworkUrl ? (
          <Image source={{ uri: item.artworkUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.placeholder]}>
            <Headphones size={24} color={Palette.primary[500]} />
          </View>
        )}
        <View style={styles.info}>
          <Text variant="titleSmall" numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={styles.author}>
            {item.author || 'Unknown'}
          </Text>
        </View>
        <ShieldCheck size={20} color={Palette.primary[500]} />
      </Surface>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Claim Your Podcast</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Search for your podcast on Apple Podcasts to verify ownership and unlock creator features.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search for your show..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          icon={() => <Search size={20} color={theme.colors.onSurfaceVariant} />}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : debouncedSearch && searchResults?.length === 0 ? (
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.onSurfaceVariant} />
          <Text style={{ marginTop: Spacing.md, color: theme.colors.onSurfaceVariant }}>
            No podcasts found
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.appleId || item.id}
          renderItem={renderResult}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !debouncedSearch ? (
              <View style={styles.center}>
                <ShieldCheck size={64} color={Palette.primary[200]} strokeWidth={1} />
                <Text style={styles.emptyTitle}>Verify Ownership</Text>
                <Text style={styles.emptySubtitle}>
                  Enter the name of your podcast to begin the verification process.
                </Text>
              </View>
            ) : null
          }
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
    padding: Spacing.lg,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchbar: {
    borderRadius: Radius.md,
    elevation: 2,
    backgroundColor: Palette.light.surface,
  },
  searchInput: {
    fontSize: 16,
  },
  list: {
    padding: Spacing.lg,
  },
  cardContainer: {
    marginBottom: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Palette.light.surface,
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
    marginRight: Spacing.md,
  },
  placeholder: {
    backgroundColor: Palette.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    color: Palette.text.lightSecondary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: Palette.text.lightSecondary,
  },
});
