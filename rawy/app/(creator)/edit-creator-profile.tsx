/**
 * Edit Creator Profile screen — edit bio and social links.
 */

import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mic, Save, Globe, Twitter, Instagram, Youtube, Camera } from 'lucide-react-native';

import { FormInput } from '@/components/ui';
import { useMyCreatorProfile, useUpdateCreatorProfile } from '@/hooks/queries/use-creators';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { pickImage } from '@/utils/image-picker';
import { SERVER_URL } from '@/services/axios-client';

type EditCreatorFormData = {
  bio: string;
  website: string;
  twitter: string;
  instagram: string;
  youtube: string;
};

export default function EditCreatorProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  
  const { data: profile, isLoading } = useMyCreatorProfile();
  const updateProfile = useUpdateCreatorProfile();

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<EditCreatorFormData>({
    defaultValues: { bio: '', website: '', twitter: '', instagram: '', youtube: '' },
  });

  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio || '',
        website: profile.socialLinks?.website || '',
        twitter: profile.socialLinks?.twitter || '',
        instagram: profile.socialLinks?.instagram || '',
        youtube: profile.socialLinks?.youtube || '',
      });
    }
  }, [profile, reset]);

  const handlePickAvatar = async () => {
    const selected = await pickImage();
    if (selected) {
      try {
        await updateProfile.mutateAsync({
          data: {}, // Just uploading avatar
          avatar: selected,
        });
      } catch (err) {
        Alert.alert('Error', 'Failed to upload avatar');
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateProfile.mutateAsync({
        data: {
          bio: data.bio.trim() || undefined,
          socialLinks: {
            website: data.website.trim() || undefined,
            twitter: data.twitter.trim() || undefined,
            instagram: data.instagram.trim() || undefined,
            youtube: data.youtube.trim() || undefined,
          }
        }
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update creator profile');
    }
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
        <View style={s.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      </SafeAreaView>
    );
  }

  const avatarSource = profile?.avatarUrl 
    ? { uri: `${SERVER_URL}/${profile.avatarUrl.replace(/\\/g, '/')}` } 
    : null;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Edit Creator Profile</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity onPress={handlePickAvatar} disabled={updateProfile.isPending} style={s.avatarContainer}>
            <Surface style={[s.iconBox, { backgroundColor: Palette.primary[50] }]} elevation={2}>
              {updateProfile.isPending && !isDirty ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : avatarSource ? (
                <Image source={avatarSource} style={s.avatarImage} />
              ) : (
                <Mic size={48} color={Palette.primary[500]} strokeWidth={1.5} />
              )}
              <View style={[s.cameraBadge, { backgroundColor: theme.colors.primary }]}>
                <Camera size={14} color="#FFF" />
              </View>
            </Surface>
          </TouchableOpacity>

          <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700', marginBottom: Spacing.md }}>About You</Text>
          <FormInput name="bio" control={control} label="Bio" placeholder="Tell your audience about yourself..." multiline numberOfLines={4} />

          <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.md }}>Social Links</Text>
          <FormInput name="website" control={control} label="Website" placeholder="https://yourwebsite.com" autoCapitalize="none" keyboardType="default" icon={<Globe size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="twitter" control={control} label="Twitter / X" placeholder="@username" autoCapitalize="none" icon={<Twitter size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="instagram" control={control} label="Instagram" placeholder="@username" autoCapitalize="none" icon={<Instagram size={20} color={theme.colors.onSurfaceVariant} />} />
          <FormInput name="youtube" control={control} label="YouTube" placeholder="Channel URL or username" autoCapitalize="none" icon={<Youtube size={20} color={theme.colors.onSurfaceVariant} />} />

          <Button mode="contained" onPress={onSubmit} loading={updateProfile.isPending} disabled={updateProfile.isPending || !isDirty}
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
  avatarContainer: { alignSelf: 'center', marginBottom: Spacing.xl },
  iconBox: { width: 110, height: 110, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', overflow: 'visible', alignSelf: 'center', marginBottom: Spacing.lg },
  avatarImage: { width: '100%', height: '100%', borderRadius: Radius.full },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF' },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
