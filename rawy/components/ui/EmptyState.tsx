import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Palette, Spacing, Radius } from '@/constants/theme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title?: string;
  message: string;
  action?: React.ReactNode;
  style?: ViewStyle;
  isCard?: boolean;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  style,
  isCard = false,
}: EmptyStateProps) {
  const theme = useTheme();

  const content = (
    <View accessibilityRole="text" accessibilityLabel={title ? `${title}. ${message}` : message}>
      {icon}
      {title && (
        <Text
          variant="titleMedium"
          style={{
            color: theme.colors.onSurface,
            marginTop: Spacing.md,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      )}
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.onSurfaceVariant,
          marginTop: title ? Spacing.xs : Spacing.md,
          textAlign: 'center',
        }}
      >
        {message}
      </Text>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );

  if (isCard) {
    return (
      <Surface
        style={[
          styles.card,
          {
            backgroundColor: Palette.light.surfaceVariant,
          },
          style,
        ]}
        elevation={0}
      >
        {content}
      </Surface>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  card: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    marginTop: Spacing.lg,
  },
});
