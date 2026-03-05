/**
 * Create Podcast screen — form with React Hook Form + Zod.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Headphones, Plus, Camera } from 'lucide-react-native';

import { FormInput } from '@/components/ui/FormInput';
import { useCreatePodcast } from '@/hooks/queries/use-podcasts';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { isCreator } from '@/utils/roles';
import { createPodcastSchema, CreatePodcastFormData } from '@/validation/podcast.schemas';
import { pickImage, SelectedImage } from '@/utils/image-picker';

export default function CreatePodcastScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createPodcast = useCreatePodcast();
  const { user } = useAuthContext();
  const [coverImage, setCoverImage] = useState<SelectedImage | null>(null);

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

  const handlePickImage = async () => {
    const selected = await pickImage();
    if (selected) {
      setCoverImage(selected);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createPodcast.mutateAsync({ 
        data,
        coverImage: coverImage || undefined
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to create podcast');
    }
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
          
          <TouchableOpacity onPress={handlePickImage} style={s.coverPicker}>
            <Surface style={[s.iconBox, { backgroundColor: Palette.primary[50] }]} elevation={2}>
              {coverImage ? (
                <Image source={{ uri: coverImage.uri }} style={s.coverImage} />
              ) : (
                <Headphones size={48} color={Palette.primary[500]} strokeWidth={1.5} />
              )}
              <View style={[s.cameraBadge, { backgroundColor: theme.colors.primary }]}>
                <Camera size={14} color="#FFF" />
              </View>
            </Surface>
            <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: Spacing.sm, fontWeight: '600' }}>
              {coverImage ? 'Change Cover' : 'Add Cover Image'}
            </Text>
          </TouchableOpacity>

          <FormInput name="title" control={control} label="Podcast Title" placeholder="e.g. Tech Talks Daily" autoCapitalize="words" icon={<Headphones size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="description" control={control} label="Description" placeholder="What is your podcast about?" multiline numberOfLines={4} />

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
  coverPicker: { alignSelf: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  iconBox: { width: 120, height: 120, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  coverImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cameraBadge: { position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
