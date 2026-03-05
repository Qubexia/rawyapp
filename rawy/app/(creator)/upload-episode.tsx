/**
 * Upload Episode screen — form with React Hook Form + Zod.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme, Menu } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Upload, Music, ChevronDown } from 'lucide-react-native';

// Lazy import to avoid crash when ExpoDocumentPicker native module is missing (Expo Go)
let DocumentPicker: typeof import('expo-document-picker') | null = null;
try {
  DocumentPicker = require('expo-document-picker');
} catch (e) {
  console.log('[UploadEpisode] Note: Document picking will require a development build.');
}

import { FormInput } from '@/components/ui';
import { createEpisodeSchema, CreateEpisodeFormData } from '@/validation/episode.schemas';
import { useCreateEpisode } from '@/hooks/queries/use-episodes';
import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useMyCreatorProfile } from '@/hooks/queries/use-creators';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isCreator } from '@/utils/roles';

export default function UploadEpisodeScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  const createEpisode = useCreateEpisode();
  const { user } = useAuthContext();

  React.useEffect(() => {
    if (user && !isCreator(user)) {
      router.replace('/(tabs)/profile' as any);
    }
  }, [user, router]);

  const [audioFile, setAudioFile] = React.useState<any>(null);
  const [podcastMenuVisible, setPodcastMenuVisible] = React.useState(false);

  const { data: creator } = useMyCreatorProfile({ enabled: !!user && isCreator(user) });
  const { data: podcastsData } = usePodcasts(creator?._id, { enabled: !!creator?._id });
  const podcasts = podcastsData?.pages.flatMap(p => p.data) || [];

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateEpisodeFormData>({
    resolver: zodResolver(createEpisodeSchema) as any,
    defaultValues: { title: '', description: '', podcastId: '' },
  });

  if (!user || (!isCreator(user))) {
    return null;
  }

  const selectedPodcastId = watch('podcastId');
  const selectedPodcast = podcasts.find(p => p._id === selectedPodcastId);

  const pickAudio = async () => {
    if (!DocumentPicker) {
      Alert.alert('Unavailable', 'Document picker requires a development build.');
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/aac'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAudioFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking audio file:', err);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!audioFile) {
      alert('Please select an audio file.');
      return;
    }

    await createEpisode.mutateAsync({
      data,
      audioFile: {
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.mimeType || 'audio/mpeg',
      },
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
          
          <View style={{ marginBottom: Spacing.md }}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8, marginLeft: 4 }}>Select Podcast</Text>
            <Surface 
              style={[s.podcastSelector, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surface, borderColor: errors.podcastId ? theme.colors.error : (isDark ? Palette.dark.border : Palette.light.border) }]} 
              elevation={0}
            >
              <Menu
                visible={podcastMenuVisible}
                onDismiss={() => setPodcastMenuVisible(false)}
                anchor={
                  <TouchableOpacity onPress={() => setPodcastMenuVisible(true)} style={s.podcastSelectorInner}>
                    <Text variant="bodyLarge" style={{ color: selectedPodcast ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                      {selectedPodcast ? selectedPodcast.title : 'Choose a podcast...'}
                    </Text>
                    <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                }
                style={{ width: '90%', marginTop: 50 }}
              >
                {podcasts.length === 0 ? (
                  <Menu.Item title="No podcasts found. Create one first!" disabled />
                ) : (
                  podcasts.map((p) => (
                    <Menu.Item 
                      key={p._id} 
                      onPress={() => {
                        setValue('podcastId', p._id, { shouldValidate: true });
                        setPodcastMenuVisible(false);
                      }} 
                      title={p.title} 
                    />
                  ))
                )}
              </Menu>
            </Surface>
            {errors.podcastId && (
              <Text variant="labelSmall" style={{ color: theme.colors.error, marginTop: 4, marginLeft: 4 }}>
                {errors.podcastId.message}
              </Text>
            )}
          </View>

          <FormInput name="description" control={control} label="Description (optional)" placeholder="Episode summary" multiline numberOfLines={4} />

          {/* Audio file picker */}
          <TouchableOpacity onPress={pickAudio} activeOpacity={0.8}>
            <Surface style={[s.uploadArea, { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.light.surfaceVariant, borderColor: isDark ? Palette.dark.border : Palette.light.border }]} elevation={0}>
              <Upload size={28} color={theme.colors.primary} />
              {audioFile ? (
                <>
                  <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginTop: 8, fontWeight: '600', textAlign: 'center' }}>{audioFile.name}</Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                    {(audioFile.size ? (audioFile.size / (1024 * 1024)).toFixed(2) : 0)} MB
                  </Text>
                </>
              ) : (
                <>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>Tap to select audio file</Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>MP3, M4A, WAV</Text>
                </>
              )}
            </Surface>
          </TouchableOpacity>

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
  podcastSelector: { borderWidth: 1, borderRadius: Radius.md, overflow: 'hidden' },
  podcastSelectorInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  uploadArea: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginTop: Spacing.md },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
