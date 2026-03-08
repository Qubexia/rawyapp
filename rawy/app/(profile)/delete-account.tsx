/**
 * Delete Account confirmation — password re-entry before permanent deletion.
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

import { FormInput } from '@/components/ui/FormInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { deleteAccount } from '@/services/users.service';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing } from '@/constants/theme';

const schema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function DeleteAccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuthContext();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await deleteAccount(data.password);
      await logout();
      router.replace('/(auth)/login' as any);
    } catch (err: any) {
      setServerError(err?.message || 'Failed to delete account');
    }
  };

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
          Delete Account
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
          <Text variant="bodyLarge" style={[s.warning, { color: theme.colors.error }]}>
            All your podcasts, episodes, and data will be permanently deleted. This cannot be undone.
          </Text>
          <Surface style={[s.card, { backgroundColor: Palette.light.surface }]} elevation={1}>
            <FormInput
              name="password"
              control={control}
              label="Enter your password to confirm"
              placeholder="Your password"
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
              style={[s.submit, { backgroundColor: theme.colors.error }]}
            >
              Delete Account
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
  warning: {
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  card: { borderRadius: 16, padding: Spacing.lg },
  error: { color: '#DC2626', marginTop: Spacing.sm },
  submit: { marginTop: Spacing.lg },
});
