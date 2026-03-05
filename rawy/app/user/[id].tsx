import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Text, Surface, IconButton, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, Users, UserCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePublicProfile } from '@/hooks/queries/use-users';
import { useToggleFollow } from '@/hooks/queries/use-follows';
import { useAuthContext } from '@/context/auth-context';
import { SERVER_URL } from '@/services/axios-client';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { user: currentUser } = useAuthContext();

  const { data: profile, isLoading, error } = usePublicProfile(id);
  const toggleFollow = useToggleFollow(id);

  const isMe = currentUser?._id === id;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${profile?.name}'s profile on Rawy!`,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[s.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[s.center, { backgroundColor: theme.colors.background }]}>
        <Text>User not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  const avatarSource = profile.avatarUrl 
    ? { uri: `${SERVER_URL}/${profile.avatarUrl.replace(/\\/g, '/')}` } 
    : null;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ fontWeight: '600' }}>Profile</Text>
        <IconButton icon={() => <Share2 size={24} color={theme.colors.onBackground} />} onPress={handleShare} />
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <Surface style={s.avatarContainer} elevation={2}>
            {avatarSource ? (
              <Image source={avatarSource} style={s.avatar} />
            ) : (
              <View style={[s.avatarPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={{ fontSize: 48, fontWeight: '700', color: theme.colors.primary }}>
                  {profile.name[0].toUpperCase()}
                </Text>
              </View>
            )}
          </Surface>

          <Text variant="headlineMedium" style={s.name}>{profile.name}</Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textTransform: 'capitalize' }}>
            {profile.role.toLowerCase()}
          </Text>

          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text variant="titleLarge" style={s.statValue}>{profile.followerCount}</Text>
              <Text variant="labelMedium" style={s.statLabel}>Followers</Text>
            </View>
            <View style={s.divider} />
            <View style={s.stat}>
              <Text variant="titleLarge" style={s.statValue}>{profile.followingCount}</Text>
              <Text variant="labelMedium" style={s.statLabel}>Following</Text>
            </View>
          </View>

          {!isMe && (
            <Button
              mode={profile.isFollowing ? "outlined" : "contained"}
              onPress={() => toggleFollow.mutate(profile.isFollowing || false)}
              loading={toggleFollow.isPending}
              style={s.followBtn}
              icon={() => profile.isFollowing ? <UserCheck size={18} color={theme.colors.primary} /> : <Users size={18} color="#FFF" />}
            >
              {profile.isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </View>

        {/* Placeholder for future sections like 'Recent Activity', 'Listen History' etc. */}
        <View style={s.section}>
          <Text variant="titleMedium" style={s.sectionTitle}>About</Text>
          <Surface style={[s.infoCard, { backgroundColor: isDark ? Palette.dark.elevated : '#FFF' }]} elevation={1}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              This user is a {profile.role.toLowerCase()} on Rawy. Join them to explore amazing stories and podcasts.
            </Text>
          </Surface>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs },
  content: { paddingBottom: Spacing.xl },
  header: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', marginBottom: Spacing.md },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '800', marginTop: Spacing.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xl, width: '80%', justifyContent: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: '800' },
  statLabel: { color: '#666' },
  divider: { width: 1, height: 30, backgroundColor: '#DDD', marginHorizontal: Spacing.lg },
  followBtn: { marginTop: Spacing.xl, minWidth: 160 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionTitle: { fontWeight: '700', marginBottom: Spacing.md },
  infoCard: { padding: Spacing.lg, borderRadius: Radius.lg },
});
