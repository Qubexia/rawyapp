import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SkeletonLoader } from './SkeletonLoader';
import { Spacing, Radius } from '@/constants/theme';

export function HomeSkeleton() {
  const theme = useTheme();
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} pointerEvents="none">
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View>
          <SkeletonLoader width={100} height={14} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={150} height={24} />
        </View>
        <SkeletonLoader width={44} height={44} borderRadius={Radius.full} />
      </View>

      {/* Trending Podcasts Skeleton */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLoader width={20} height={20} borderRadius={Radius.xs} />
          <SkeletonLoader width={160} height={20} style={{ marginLeft: Spacing.sm }} />
        </View>
        <View style={styles.horizontalList}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.podcastCard}>
              <SkeletonLoader width={140} height={140} borderRadius={Radius.lg} />
              <SkeletonLoader width={120} height={16} style={{ marginTop: Spacing.sm }} />
              <SkeletonLoader width={80} height={12} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
      </View>

      {/* Suggested Following Skeleton */}
      <View style={[styles.section, { paddingHorizontal: Spacing.lg }]}>
        <SkeletonLoader width="100%" height={120} borderRadius={Radius.lg} />
      </View>

      {/* Recommended Episodes Skeleton */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonLoader width={20} height={20} borderRadius={Radius.xs} />
          <SkeletonLoader width={180} height={20} style={{ marginLeft: Spacing.sm }} />
        </View>
        <View style={styles.verticalList}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.episodeRow}>
              <SkeletonLoader width={64} height={64} borderRadius={Radius.md} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="40%" height={12} style={{ marginBottom: 4 }} />
                <SkeletonLoader width="30%" height={12} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  podcastCard: {
    width: 140,
    marginRight: Spacing.md,
  },
  verticalList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
});
