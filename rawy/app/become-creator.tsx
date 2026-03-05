/**
 * Become a Creator screen.
 * Allows a regular listener to become a creator by providing a show/podcast name.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, Surface, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mic } from 'lucide-react-native';
import { z } from 'zod';

import { FormInput } from '@/components/ui/FormInput';
import { useBecomeCreator } from '@/hooks/queries/use-creators';
import { useAuthContext } from '@/context/auth-context';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const becomeCreatorSchema = z.object({
  showName: z
    .string()
    .min(1, 'Show / Podcast name is required')
    .min(2, 'Show name must be at least 2 characters')
    .max(100, 'Show name must not exceed 100 characters')
    .transform((v) => v.trim()),
});

type FormData = z.infer<typeof becomeCreatorSchema>;

export default function BecomeCreatorScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();
  
  const { updateUserRole } = useAuthContext();
  const becomeCreator = useBecomeCreator();

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(becomeCreatorSchema) as any,
    defaultValues: { showName: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await becomeCreator.mutateAsync(data.showName);
      // Update role explicitly since token hasn't changed
      if (updateUserRole) {
        updateUserRole('CREATOR');
      }
      router.replace('/creator-dashboard' as any);
    } catch (error) {
      console.error('Failed to become creator:', error);
      // Handle error visually if necessary
    }
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <IconButton 
          icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />} 
          onPress={() => router.back()} 
        />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          Become a Creator
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={{ padding: Spacing.xl }} 
          keyboardShouldPersistTaps="handled"
        >
          <Surface 
            style={[
              styles.iconBox, 
              { backgroundColor: isDark ? Palette.dark.surfaceVariant : Palette.primary[50] }
            ]} 
            elevation={0}
          >
            <Mic 
              size={48} 
              color={isDark ? Palette.primary[300] : Palette.primary[500]} 
              strokeWidth={1.5} 
            />
          </Surface>

          <View style={styles.textContainer}>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
              Start your journey
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Create your own podcasts, upload episodes, and build your audience on Rawy.
            </Text>
          </View>

          <FormInput 
            name="showName" 
            control={control} 
            label="Podcast / Show Name" 
            placeholder="e.g. My Awesome Podcast" 
            autoCapitalize="words" 
            icon={<Mic size={20} color={theme.colors.onSurfaceVariant} />} 
          />

          <Button 
            mode="contained" 
            onPress={onSubmit} 
            loading={becomeCreator.isPending} 
            disabled={becomeCreator.isPending}
            style={styles.submitBtn} 
            contentStyle={{ height: 52 }} 
            labelStyle={{ fontSize: 16, fontWeight: '600' }}
          >
            Join as Creator
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: Spacing.xs 
  },
  iconBox: { 
    width: 96, 
    height: 96, 
    borderRadius: Radius.xl, 
    alignItems: 'center', 
    justifyContent: 'center', 
    alignSelf: 'center', 
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  submitBtn: { 
    borderRadius: Radius.md, 
    marginTop: Spacing.xl 
  },
});
