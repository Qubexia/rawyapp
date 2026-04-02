/**
 * Edit Podcast screen — form with React Hook Form + Zod.
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Headphones, Save, Camera } from 'lucide-react-native';

import { FormInput } from '@/components/ui';
import { usePodcast, useUpdatePodcast } from '@/hooks/queries/use-podcasts';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { isCreator } from '@/utils/roles';
import { updatePodcastSchema, UpdatePodcastFormData } from '@/validation/podcast.schemas';
import { pickImage, SelectedImage } from '@/utils/image-picker';
import { SERVER_URL } from '@/services/axios-client';

export default function EditPodcastScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const updatePodcast = useUpdatePodcast();
  const { user } = useAuthContext();
  const [newCover, setNewCover] = useState<SelectedImage | null>(null);

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

  const handlePickImage = async () => {
    const selected = await pickImage();
    if (selected) {
      setNewCover(selected);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updatePodcast.mutateAsync({ 
        id, 
        data,
        coverImage: newCover || undefined 
      });
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

  const currentCoverUrl = podcast?.coverImageUrl 
    ? { uri: `${SERVER_URL}/${podcast.coverImageUrl.replace(/\\/g, '/')}` } 
    : null;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Edit Podcast</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity onPress={handlePickImage} style={s.coverPicker}>
            <Surface style={[s.iconBox, { backgroundColor: Palette.primary[50] }]} elevation={2}>
              {newCover ? (
                <Image source={{ uri: newCover.uri }} style={s.coverImage} />
              ) : currentCoverUrl ? (
                <Image source={currentCoverUrl} style={s.coverImage} />
              ) : (
                <Headphones size={48} color={Palette.primary[500]} strokeWidth={1.5} />
              )}
              <View style={[s.cameraBadge, { backgroundColor: theme.colors.primary }]}>
                <Camera size={14} color={Palette.white.pure} />
              </View>
            </Surface>
            <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: Spacing.sm, fontWeight: '600' }}>
              Change Cover Image
            </Text>
          </TouchableOpacity>

          <FormInput name="title" control={control} label="Podcast Title" placeholder="e.g. Tech Talks Daily" autoCapitalize="words" icon={<Headphones size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="description" control={control} label="Description" placeholder="What is your podcast about?" multiline numberOfLines={4} />

          <Button mode="contained" onPress={onSubmit} loading={updatePodcast.isPending} disabled={updatePodcast.isPending || (!isDirty && !newCover)}
            style={s.submitBtn} contentStyle={{ height: 52 }} labelStyle={{ fontSize: 16, fontWeight: '600' }}
            icon={() => <Save size={18} color={Palette.white.pure} />}>
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
  coverPicker: { alignSelf: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  iconBox: { width: 120, height: 120, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cameraBadge: { position: 'absolute', bottom: 4, right: 4, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Palette.white.pure },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});

