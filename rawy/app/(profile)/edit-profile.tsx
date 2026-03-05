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
import { SERVER_URL } from '@/services/axios-client';

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

  const avatarSource = user.avatarUrl 
    ? { uri: `${SERVER_URL}/${user.avatarUrl.replace(/\\/g, '/')}` } 
    : null;

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
            <Surface style={[s.iconBox, { backgroundColor: Palette.primary[50] }]} elevation={2}>
              {updateAvatar.isPending ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : avatarSource ? (
                <Image source={avatarSource} style={s.avatarImage} />
              ) : (
                <User size={48} color={Palette.primary[500]} strokeWidth={1.5} />
              )}
              <View style={[s.cameraBadge, { backgroundColor: theme.colors.primary }]}>
                <Camera size={14} color="#FFF" />
              </View>
            </Surface>
          </TouchableOpacity>

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
  avatarContainer: { alignSelf: 'center', marginBottom: Spacing.xl },
  iconBox: { width: 110, height: 110, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  avatarImage: { width: '100%', height: '100%', borderRadius: Radius.full },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF' },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});

