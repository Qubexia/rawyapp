import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SkeletonLoader } from './SkeletonLoader';
import { Spacing, Radius } from '@/constants/theme';

export function NotificationsSkeleton() {
  return (
    <View style={styles.container} pointerEvents="none">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={styles.notificationRow}>
          <SkeletonLoader width={48} height={48} borderRadius={24} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <SkeletonLoader width="90%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLoader width="60%" height={14} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={40} height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  notificationRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
});
