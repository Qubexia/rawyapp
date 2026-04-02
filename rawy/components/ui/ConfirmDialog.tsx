/**
 * ConfirmDialog — reusable modal confirmation dialog.
 * Uses RN built-in Animated (reliable inside Modals on Android).
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Pressable,
  Animated,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Trash2, Info } from 'lucide-react-native';
import { Palette, Radius, Spacing } from '@/constants/theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.88);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 120,
      }).start();
    }
  }, [visible, scale]);

  const isDestructive = variant === 'destructive';
  const accentColor = isDestructive ? '#EF4444' : theme.colors.primary;
  const iconBg = isDestructive ? '#FEF2F2' : Palette.primary[50];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.centerer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface },
            { transform: [{ scale }] },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
            {isDestructive ? (
              <Trash2 size={26} color={accentColor} strokeWidth={1.8} />
            ) : (
              <Info size={26} color={accentColor} strokeWidth={1.8} />
            )}
          </View>

          {/* Title */}
          <Text
            variant="titleMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            variant="bodyMedium"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            {message}
          </Text>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.outlineVariant ?? '#E5E7EB' },
            ]}
          />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.cancelBtn,
                { opacity: pressed ? 0.65 : 1 },
              ]}
              onPress={onCancel}
            >
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onSurfaceVariant, fontWeight: '600' }}
              >
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: accentColor, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={onConfirm}
            >
              <Text
                variant="labelLarge"
                style={{ color: Palette.white.pure, fontWeight: '700' }}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  centerer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: Radius.xl,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    shadowColor: Palette.black.pure,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
});
