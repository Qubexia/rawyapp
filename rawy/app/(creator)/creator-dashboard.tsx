/**
 * Creator Dashboard — manage podcasts, upload episodes.
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Headphones, Upload, BarChart3, Mic, MoreVertical, Edit2, Trash2 } from 'lucide-react-native';

import { EmptyState } from '@/components/ui';
import { useMyCreatorProfile } from '@/hooks/queries/use-creators';
import { usePodcasts, useDeletePodcast } from '@/hooks/queries/use-podcasts';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { isCreator } from '@/utils/roles';
import type { Podcast } from '@/services/podcasts.service';

export default function CreatorDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();
  const deletePodcast = useDeletePodcast();

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useMyCreatorProfile();
  const { data: podcastsData, isLoading: podcastsLoading, refetch: refetchPodcasts } = usePodcasts(
    profile?._id,
    { enabled: !!profile?._id },
  );
  const podcasts = podcastsData?.pages.flatMap((p) => p.data) ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchPodcasts()]);
    setRefreshing(false);
  }, [refetchProfile, refetchPodcasts]);

  React.useEffect(() => {
    if (user && !isCreator(user)) {
      router.replace('/(tabs)/profile' as any);
    }
  }, [user, router]);

  if (!user || (!isCreator(user))) {
    return null;
  }

  const confirmDelete = (id: string, title: string) => {
    import('react-native').then(({ Alert }) => {
      Alert.alert(
        'Delete Podcast',
        `Are you sure you want to delete "${title}" and all its episodes? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deletePodcast.mutate(id),
          },
        ]
      );
    });
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Creator Dashboard</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Stats */}
        <View style={s.statsRow}>
          <Surface style={[s.statCard, { backgroundColor: Palette.light.surface }]} elevation={1}>
            <Headphones size={24} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700', marginTop: 8 }}>{profile?.podcastCount || podcasts.length}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Podcasts</Text>
          </Surface>
          <Surface style={[s.statCard, { backgroundColor: Palette.light.surface }]} elevation={1}>
            <Mic size={24} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700', marginTop: 8 }}>{podcasts.reduce((acc, p) => acc + (p.episodeCount || 0), 0)}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Episodes</Text>
          </Surface>
          <Surface style={[s.statCard, { backgroundColor: Palette.light.surface }]} elevation={1}>
            <BarChart3 size={24} color={Palette.secondary[500]} />
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700', marginTop: 8 }}>{profile?.followerCount || 0}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Followers</Text>
          </Surface>
        </View>

        {/* Quick actions */}
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700', marginBottom: Spacing.md }}>Quick Actions</Text>
        <View style={s.actionsRow}>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: Palette.primary[500] }]} activeOpacity={0.8} onPress={() => router.push('/(creator)/create-podcast' as any)}>
            <Plus size={24} color="#FFF" />
            <Text style={s.actionText}>New Podcast</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: Palette.secondary[500] }]} activeOpacity={0.8} onPress={() => router.push('/(creator)/upload-episode' as any)}>
            <Upload size={24} color="#FFF" />
            <Text style={s.actionText}>Upload Episode</Text>
          </TouchableOpacity>
        </View>

        {/* My Podcasts */}
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.md }}>My Podcasts</Text>
        {podcasts.length > 0 ? podcasts.map((p, idx) => (
          <Surface key={p?._id ? String(p._id) : String(idx)} style={[s.podcastRow, { backgroundColor: Palette.light.surface }]} elevation={1}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} activeOpacity={0.8} onPress={() => router.push(`/podcast/${p._id}` as any)}>
              <View style={[s.podcastIcon, { backgroundColor: Palette.primary[50] }]}>
                <Mic size={20} color={Palette.primary[500]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" numberOfLines={1} style={{ color: theme.colors.onSurface, fontWeight: '600' }}>{p.title}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{p.episodeCount || 0} episodes</Text>
              </View>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton
                icon={() => <Upload size={20} color={theme.colors.onSurfaceVariant} />}
                onPress={() => router.push({ pathname: '/(creator)/upload-episode', params: { preselect: p._id } } as any)}
                size={20}
              />
              <IconButton
                icon={() => <Edit2 size={20} color={theme.colors.onSurfaceVariant} />}
                onPress={() => router.push(`/edit-podcast?id=${p._id}` as any)}
                size={20}
              />
              <IconButton
                icon={() => <Trash2 size={20} color={theme.colors.error} />}
                onPress={() => confirmDelete(p._id, p.title)}
                size={20}
              />
            </View>
          </Surface>
        )) : (
          <EmptyState
            icon={<Headphones size={32} color={theme.colors.onSurfaceVariant} strokeWidth={1} />}
            message="No podcasts yet. Create your first!"
            isCard
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  statCard: { flex: 1, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center' },
  actionsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  actionCard: { flex: 1, borderRadius: Radius.xl, padding: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#FFF', fontWeight: '700', fontSize: 14, marginTop: 8 },
  podcastRow: { flexDirection: 'row', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm },
  podcastIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  empty: { borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center' },
});
