/**
 * Edit Profile screen — edit name.
 */

import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Save } from 'lucide-react-native';

import { FormInput } from '@/components/ui';
import { useUpdateMe } from '@/hooks/queries/use-users';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type EditProfileFormData = { name: string };

export default function EditProfileScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const { user } = useAuthContext();
  const updateMe = useUpdateMe();

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<EditProfileFormData>({
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!data.name.trim()) return;
      await updateMe.mutateAsync({ name: data.name });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    }
  });

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Edit Profile</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
          <Surface style={[s.iconBox, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.primary[50] }]} elevation={0}>
            <User size={48} color={isDark ? Palette.primary[300] : Palette.primary[500]} strokeWidth={1.5} />
          </Surface>

          <FormInput name="name" control={control} label="Full Name" placeholder="e.g. John Doe" autoCapitalize="words" icon={<User size={20} color={theme.colors.onSurfaceVariant} />} />

          <Button mode="contained" onPress={onSubmit} loading={updateMe.isPending} disabled={updateMe.isPending || !isDirty}
            style={s.submitBtn} contentStyle={{ height: 52 }} labelStyle={{ fontSize: 16, fontWeight: '600' }}
            icon={() => <Save size={18} color="#FFF" />}>
            Save Changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs },
  iconBox: { width: 96, height: 96, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing.lg },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
