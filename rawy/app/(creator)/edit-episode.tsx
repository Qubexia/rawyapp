/**
 * Edit Episode screen — form with React Hook Form + Zod.
 */

import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Play, Save } from 'lucide-react-native';
import { z } from 'zod';

import { FormInput } from '@/components/ui';
import { useEpisode, useUpdateEpisode } from '@/hooks/queries/use-episodes';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isCreator } from '@/utils/roles';

const updateEpisodeSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(200, 'Title must not exceed 200 characters')
    .transform((v) => v.trim())
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description must not exceed 5000 characters')
    .optional(),
});

type UpdateEpisodeFormData = z.infer<typeof updateEpisodeSchema>;

export default function EditEpisodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const updateEpisode = useUpdateEpisode();
  const { user } = useAuthContext();

  const { data: episode, isLoading } = useEpisode(id);

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<UpdateEpisodeFormData>({
    resolver: zodResolver(updateEpisodeSchema) as any,
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    if (episode) {
      reset({
        title: episode.title,
        description: episode.description || '',
      });
    }
  }, [episode, reset]);

  useEffect(() => {
    if (user && !isCreator(user)) {
      router.replace('/(tabs)/profile' as any);
    }
  }, [user, router]);

  if (!user || (!isCreator(user))) {
    return null;
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateEpisode.mutateAsync({ id, data });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update episode');
    }
  });

  if (isLoading) {
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
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Edit Episode</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
          <Surface style={[s.iconBox, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.primary[50], overflow: 'hidden' }]} elevation={0}>
            {episode?.podcast?.coverImageUrl ? (
              <Image source={{ uri: episode.podcast.coverImageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            ) : (
              <Play size={48} color={isDark ? Palette.primary[300] : Palette.primary[500]} strokeWidth={1.5} />
            )}
          </Surface>

          <FormInput name="title" control={control} label="Episode Title" autoCapitalize="words" icon={<Play size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="description" control={control} label="Description" multiline numberOfLines={4} />

          <Button mode="contained" onPress={onSubmit} loading={updateEpisode.isPending} disabled={updateEpisode.isPending || !isDirty}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs },
  iconBox: { width: 96, height: 96, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: Spacing.lg },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
