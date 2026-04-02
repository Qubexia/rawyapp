/**
 * Edit Profile screen — edit name.
 */

import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ArrowLeft, User, Save, Camera } from 'lucide-react-native';

import { FormInput } from '@/components/ui';
import { useUpdateMe, useUpdateAvatar } from '@/hooks/queries/use-users';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { pickImage } from '@/utils/image-picker';
import { resolveImageUrl } from '@/utils/url';

type EditProfileFormData = { name: string };

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();
  const updateMe = useUpdateMe();
  const updateAvatar = useUpdateAvatar();

  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<EditProfileFormData>({
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  if (!user) return null;

  const handlePickImage = async () => {
    const selected = await pickImage();
    if (selected) {
      try {
        await updateAvatar.mutateAsync(selected);
      } catch (err) {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!data.name.trim()) return;
      await updateMe.mutateAsync({ name: data.name });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    }
  });

  const avatarUri = resolveImageUrl(user.avatarUrl);
  const avatarSource = avatarUri ? { uri: avatarUri } : null;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>Edit Profile</Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={handlePickImage} disabled={updateAvatar.isPending} style={s.avatarContainer}>
            <View style={s.avatarWrapper}>
              <View style={[s.avatarClip, { backgroundColor: Palette.primary[50] }]}>
                {updateAvatar.isPending ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : avatarSource ? (
                  <Image source={avatarSource} style={s.avatarImage} />
                ) : (
                  <User size={48} color={Palette.primary[500]} strokeWidth={1.5} />
                )}
              </View>
              <View style={[s.cameraBadge, { backgroundColor: theme.colors.primary }]}>
                <Camera size={14} color={Palette.white.pure} />
              </View>
            </View>
          </TouchableOpacity>

          <FormInput name="name" control={control} label="Full Name" placeholder="e.g. John Doe" autoCapitalize="words" icon={<User size={20} color={theme.colors.onSurfaceVariant} />} />

          <Button mode="contained" onPress={onSubmit} loading={updateMe.isPending} disabled={updateMe.isPending || !isDirty}
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xs },
  avatarContainer: { alignSelf: 'center', marginBottom: Spacing.xl },
  avatarWrapper: { width: 110, height: 110, position: 'relative' },
  avatarClip: { width: 110, height: 110, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Palette.white.pure },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});

