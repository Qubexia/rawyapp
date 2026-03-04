/**
 * Creator Dashboard — manage podcasts, upload episodes.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Headphones, Upload, BarChart3, Mic } from 'lucide-react-native';

import { useMyCreatorProfile } from '@/hooks/queries/use-creators';
import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Podcast } from '@/services/podcasts.service';

export default function CreatorDashboard() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { user } = useAuthContext();

  const { data: profile, isLoading: profileLoading } = useMyCreatorProfile();
  const { data: podcastsData, isLoading: podcastsLoading } = usePodcasts(
    profile?._id,
    { enabled: !!profile?._id },
  );
  const podcasts = podcastsData?.pages.flatMap((p) => p.data) ?? [];

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
        {/* Stats */}
        <View style={s.statsRow}>
          <Surface style={[s.statCard, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surface }]} elevation={1}>
            <Headphones size={24} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700', marginTop: 8 }}>{profile?.podcastCount || podcasts.length}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Podcasts</Text>
          </Surface>
          <Surface style={[s.statCard, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surface }]} elevation={1}>
            <BarChart3 size={24} color={Palette.secondary[500]} />
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700', marginTop: 8 }}>{profile?.followerCount || 0}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Followers</Text>
          </Surface>
        </View>

        {/* Quick actions */}
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700', marginBottom: Spacing.md }}>Quick Actions</Text>
        <View style={s.actionsRow}>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: Palette.primary[500] }]} activeOpacity={0.8} onPress={() => router.push('/create-podcast' as any)}>
            <Plus size={24} color="#FFF" />
            <Text style={s.actionText}>New Podcast</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionCard, { backgroundColor: Palette.secondary[500] }]} activeOpacity={0.8} onPress={() => router.push('/upload-episode' as any)}>
            <Upload size={24} color="#FFF" />
            <Text style={s.actionText}>Upload Episode</Text>
          </TouchableOpacity>
        </View>

        {/* My Podcasts */}
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.md }}>My Podcasts</Text>
        {podcasts.length > 0 ? podcasts.map((p, idx) => (
          <TouchableOpacity key={p?._id ? String(p._id) : String(idx)} activeOpacity={0.8} onPress={() => router.push(`/podcast/${p._id}` as any)}>
            <Surface style={[s.podcastRow, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surface }]} elevation={1}>
              <View style={[s.podcastIcon, { backgroundColor: isDark ? Palette.dark.elevated : Palette.primary[50] }]}>
                <Mic size={20} color={isDark ? Palette.primary[300] : Palette.primary[500]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" numberOfLines={1} style={{ color: theme.colors.onSurface, fontWeight: '600' }}>{p.title}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{p.episodeCount || 0} episodes</Text>
              </View>
            </Surface>
          </TouchableOpacity>
        )) : (
          <Surface style={[s.empty, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surfaceVariant }]} elevation={0}>
            <Headphones size={32} color={theme.colors.onSurfaceVariant} strokeWidth={1} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>No podcasts yet. Create your first!</Text>
          </Surface>
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
