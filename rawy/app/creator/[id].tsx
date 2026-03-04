/**
 * Creator profile screen — bio, podcasts, follow.
 */

import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Mic, Headphones, UserPlus, UserCheck, Users } from 'lucide-react-native';

import { useCreator } from '@/hooks/queries/use-creators';
import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useFollowStatus, useToggleFollow } from '@/hooks/queries/use-follows';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Podcast } from '@/services/podcasts.service';

export default function CreatorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  const { data: creator, isLoading } = useCreator(id);
  const { data: podcastsData } = usePodcasts(id);
  const { data: followStatus } = useFollowStatus(id);
  const toggleFollow = useToggleFollow(id);

  const podcasts = podcastsData?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const renderPodcast = ({ item }: { item: Podcast }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(`/podcast/${item._id}` as any)}>
      <Surface style={[s.podcastRow, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surface }]} elevation={1}>
        <View style={[s.podcastIcon, { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[50] }]}>
          <Headphones size={22} color={isDark ? Palette.primary[300] : Palette.primary[500]} strokeWidth={1.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" numberOfLines={1} style={{ color: theme.colors.onSurface, fontWeight: '600' }}>{item.title}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.episodeCount || 0} episodes</Text>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const Header = () => (
    <>
      {/* Profile */}
      <View style={s.profile}>
        <View style={[s.avatar, { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[100] }]}>
          <Mic size={36} color={isDark ? Palette.primary[300] : Palette.primary[500]} />
        </View>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '800', marginTop: Spacing.md }}>{creator?.name}</Text>
        {creator?.showName && <Text variant="titleSmall" style={{ color: theme.colors.primary, marginTop: 4 }}>{creator.showName}</Text>}
        {creator?.bio && <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 22 }}>{creator.bio}</Text>}

        <View style={s.stats}>
          <View style={s.stat}>
            <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>{followStatus?.followerCount ?? creator?.followerCount ?? 0}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Followers</Text>
          </View>
          <View style={s.stat}>
            <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>{creator?.podcastCount || podcasts.length}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Podcasts</Text>
          </View>
        </View>

        <Button
          mode={followStatus?.isFollowing ? 'outlined' : 'contained'}
          onPress={() => toggleFollow.mutate(followStatus?.isFollowing || false)}
          loading={toggleFollow.isPending}
          icon={() => followStatus?.isFollowing ? <UserCheck size={18} color={theme.colors.primary} /> : <UserPlus size={18} color="#FFF" />}
          style={s.followBtn}
          contentStyle={{ height: 44 }}
        >
          {followStatus?.isFollowing ? 'Following' : 'Follow'}
        </Button>
      </View>

      {podcasts.length > 0 && (
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.md }}>
          <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Podcasts</Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
      </View>
      <FlatList data={podcasts} keyExtractor={(i, index) => i?._id ? String(i._id) : String(index)} renderItem={renderPodcast} ListHeaderComponent={Header}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, gap: Spacing.sm }} showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={s.empty}><Headphones size={32} color={theme.colors.onSurfaceVariant} strokeWidth={1} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>No podcasts yet</Text></View>
        )} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xs },
  profile: { alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: Spacing.xl, marginTop: Spacing.lg },
  stat: { alignItems: 'center' },
  followBtn: { marginTop: Spacing.lg, borderRadius: Radius.md, minWidth: 140 },
  podcastRow: { flexDirection: 'row', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  podcastIcon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
});
