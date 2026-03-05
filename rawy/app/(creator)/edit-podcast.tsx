/**
 * Edit Podcast screen — form with React Hook Form + Zod.
 */

import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Headphones, Save } from 'lucide-react-native';

import { FormInput } from '@/components/ui';
import { usePodcast, useUpdatePodcast } from '@/hooks/queries/use-podcasts';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isCreator } from '@/utils/roles';
import { updatePodcastSchema, UpdatePodcastFormData } from '@/validation/podcast.schemas';

export default function EditPodcastScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const updatePodcast = useUpdatePodcast();
  const { user } = useAuthContext();

  const { data: podcast, isLoading } = usePodcast(id);

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<UpdatePodcastFormData>({
    resolver: zodResolver(updatePodcastSchema) as any,
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    if (podcast) {
      reset({
        title: podcast.title,
        description: podcast.description || '',
      });
    }
  }, [podcast, reset]);

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
      await updatePodcast.mutateAsync({ id, data });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update podcast');
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
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Edit Podcast</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
          <Surface style={[s.iconBox, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.primary[50], overflow: 'hidden' }]} elevation={0}>
            {podcast?.coverImageUrl ? (
              <Image source={{ uri: podcast.coverImageUrl }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
            ) : (
              <Headphones size={48} color={isDark ? Palette.primary[300] : Palette.primary[500]} strokeWidth={1.5} />
            )}
          </Surface>

          <FormInput name="title" control={control} label="Podcast Title" placeholder="e.g. Tech Talks Daily" autoCapitalize="words" icon={<Headphones size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="description" control={control} label="Description" placeholder="What is your podcast about?" multiline numberOfLines={4} />

          <Button mode="contained" onPress={onSubmit} loading={updatePodcast.isPending} disabled={updatePodcast.isPending || !isDirty}
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
