/**
 * Upload Episode screen — form with React Hook Form + Zod.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Upload, Music } from 'lucide-react-native';

import { FormInput } from '@/components/ui/FormInput';
import { createEpisodeSchema, CreateEpisodeFormData } from '@/validation/auth.schemas';
import { useCreateEpisode } from '@/hooks/queries/use-episodes';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function UploadEpisodeScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const createEpisode = useCreateEpisode();

  const { control, handleSubmit, formState: { errors } } = useForm<CreateEpisodeFormData>({
    resolver: zodResolver(createEpisodeSchema) as any,
    defaultValues: { title: '', description: '', podcastId: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    // TODO: integrate audio file picker (expo-document-picker)
    // For now, show the form validation flow
    await createEpisode.mutateAsync({
      data,
      audioFile: { uri: '', name: 'episode.mp3', type: 'audio/mpeg' },
    });
    router.back();
  });

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Upload Episode</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
          <Surface style={[s.iconBox, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.secondary[400] + '20' }]} elevation={0}>
            <Music size={48} color={isDark ? Palette.secondary[400] : Palette.secondary[500]} strokeWidth={1.5} />
          </Surface>

          <FormInput name="title" control={control} label="Episode Title" placeholder="e.g. Episode 1: Introduction" autoCapitalize="words" icon={<Music size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="podcastId" control={control} label="Podcast ID" placeholder="Select a podcast" />
          <FormInput name="description" control={control} label="Description (optional)" placeholder="Episode summary" multiline numberOfLines={4} />

          {/* Audio file picker placeholder */}
          <Surface style={[s.uploadArea, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surfaceVariant, borderColor: isDark ? Palette.dark.border : Palette.light.border }]} elevation={0}>
            <Upload size={28} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>Tap to select audio file</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>MP3, M4A, WAV</Text>
          </Surface>

          <Button mode="contained" onPress={onSubmit} loading={createEpisode.isPending} disabled={createEpisode.isPending}
            style={s.submitBtn} contentStyle={{ height: 52 }} labelStyle={{ fontSize: 16, fontWeight: '600' }}
            icon={() => <Upload size={18} color="#FFF" />}>
            Upload Episode
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
  uploadArea: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginTop: Spacing.md },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
