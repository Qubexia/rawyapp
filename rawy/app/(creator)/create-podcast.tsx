/**
 * Create Podcast screen — form with React Hook Form + Zod.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Headphones, Plus } from 'lucide-react-native';

import { FormInput } from '@/components/ui/FormInput';
import { useCreatePodcast } from '@/hooks/queries/use-podcasts';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isCreator } from '@/utils/roles';
import { createPodcastSchema, CreatePodcastFormData } from '@/validation/podcast.schemas';

export default function CreatePodcastScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const createPodcast = useCreatePodcast();
  const { user } = useAuthContext();

  React.useEffect(() => {
    if (user && !isCreator(user)) {
      router.replace('/(tabs)/profile' as any);
    }
  }, [user, router]);

  const { control, handleSubmit, formState: { errors } } = useForm<CreatePodcastFormData>({
    resolver: zodResolver(createPodcastSchema) as any,
    defaultValues: { title: '', description: '' },
  });

  if (!user || (!isCreator(user))) {
    return null;
  }

  const onSubmit = handleSubmit(async (data) => {
    await createPodcast.mutateAsync({ data });
    router.back();
  });

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>New Podcast</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
          <Surface style={[s.iconBox, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.primary[50] }]} elevation={0}>
            <Headphones size={48} color={isDark ? Palette.primary[300] : Palette.primary[500]} strokeWidth={1.5} />
          </Surface>

          <FormInput name="title" control={control} label="Podcast Title" placeholder="e.g. Tech Talks Daily" autoCapitalize="words" icon={<Headphones size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="description" control={control} label="Description (optional)" placeholder="What is your podcast about?" multiline numberOfLines={4} />

          <Button mode="contained" onPress={onSubmit} loading={createPodcast.isPending} disabled={createPodcast.isPending}
            style={s.submitBtn} contentStyle={{ height: 52 }} labelStyle={{ fontSize: 16, fontWeight: '600' }}
            icon={() => <Plus size={18} color="#FFF" />}>
            Create Podcast
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
