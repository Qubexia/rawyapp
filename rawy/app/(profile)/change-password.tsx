/**
 * Change Password screen — current password, new password, confirm.
 */

import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { FormInput } from '@/components/ui/FormInput';
import { changePassword } from '@/services/auth.service';
import { Palette, Spacing, Radius } from '@/constants/theme';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      setSuccess(true);
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      setServerError(err?.message || 'Failed to change password');
    }
  };

  if (success) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.center}>
          <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
            Password changed successfully
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <Button
          mode="text"
          onPress={() => router.back()}
          icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
          contentStyle={{ flexDirection: 'row-reverse' }}
        >
          Back
        </Button>
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          Change Password
        </Text>
        <View style={{ width: 64 }} />
      </View>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Surface style={[s.card, { backgroundColor: Palette.light.surface }]} elevation={1}>
            <FormInput
              name="currentPassword"
              control={control}
              label="Current Password"
              placeholder="Enter your current password"
              secureTextEntry
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            <FormInput
              name="newPassword"
              control={control}
              label="New Password"
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            <FormInput
              name="confirmPassword"
              control={control}
              label="Confirm New Password"
              placeholder="Re-enter your new password"
              secureTextEntry
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            {serverError && (
              <Text variant="bodySmall" style={s.error}>
                {serverError}
              </Text>
            )}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={s.submit}
            >
              Change Password
            </Button>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { borderRadius: Radius.lg, padding: Spacing.lg },
  error: { color: '#DC2626', marginTop: Spacing.sm },
  submit: { marginTop: Spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
