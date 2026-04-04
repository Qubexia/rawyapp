import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, useTheme, Surface, Menu, ProgressBar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ChevronDown, CheckCircle2, Mic } from 'lucide-react-native';

import { FormInput } from '@/components/ui';
import { RecordingControls } from '@/components/ui/RecordingControls';
import { RecordingTimer } from '@/components/ui/RecordingTimer';
import { RecordingPreview } from '@/components/ui/RecordingPreview';
import { createEpisodeSchema, CreateEpisodeFormData } from '@/validation/episode.schemas';
import { createRecordingSession, RecordingResult } from '@/utils/audio-recording';
import { pickImage as pickImageUtil, SelectedImage } from '@/utils/image-picker';
import { isCreator } from '@/utils/roles';
import { Palette, Spacing, Radius } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { usePodcasts } from '@/hooks/queries/use-podcasts';
import { useMyCreatorProfile } from '@/hooks/queries/use-creators';
import { useRecordEpisode } from '@/hooks/queries/use-episodes';

export default function RecordEpisodeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();
  const recordEpisode = useRecordEpisode();

  const [session] = useState(() => createRecordingSession());
  const [recordingStatus, setRecordingStatus] = useState(session.getStatus());
  const [duration, setDuration] = useState(0);
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);

  const [imageFile, setImageFile] = useState<SelectedImage | null>(null);
  const [podcastMenuVisible, setPodcastMenuVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: creator } = useMyCreatorProfile(user?._id, { enabled: !!user && isCreator(user) });
  const { data: podcastsData } = usePodcasts({ creatorId: creator?._id }, { enabled: !!creator?._id });
  const podcasts = podcastsData?.pages.flatMap((p) => p.data) || [];

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateEpisodeFormData>({
    resolver: zodResolver(createEpisodeSchema) as any,
    defaultValues: { title: "", description: "", podcastId: "" },
  });

  const selectedPodcastId = watch("podcastId");
  const selectedPodcast = podcasts.find((p) => p._id === selectedPodcastId);

  useEffect(() => {
    if (user && !isCreator(user)) {
      router.replace('/(tabs)/profile' as any);
    }
  }, [user, router]);

  useEffect(() => {
    const unsubStatus = session.onStatusChange(setRecordingStatus);
    const unsubDuration = session.onDurationUpdate(setDuration);
    return () => {
      unsubStatus();
      unsubDuration();
      session.cleanup();
    };
  }, [session]);

  if (!user || !isCreator(user)) return null;

  const handleStart = async () => {
    try {
      await session.start();
    } catch (err: any) {
      Alert.alert("Permission Denied", "Microphone access is required to record audio.");
    }
  };

  const handlePause = async () => await session.pause();
  const handleResume = async () => await session.resume();
  
  const handleStop = async () => {
    const result = await session.stop();
    setRecordingResult(result);
    // Auto-fill title with a default
    setValue('title', `Studio Recording ${new Date().toLocaleDateString()}`, { shouldValidate: true });
  };

  const handleRetake = () => {
    Alert.alert(
      "Retake Recording?",
      "Your current recording will be discarded.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Retake", 
          style: "destructive",
          onPress: () => {
            setRecordingResult(null);
            setDuration(0);
          }
        }
      ]
    );
  };

  const pickImage = async () => {
    const image = await pickImageUtil();
    if (image) setImageFile(image);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!recordingResult) {
      Alert.alert("Error", "Please record an episode first.");
      return;
    }

    setUploadProgress(0);
    try {
      await recordEpisode.mutateAsync({
        data: { ...data, duration: recordingResult.durationSeconds },
        recordingUri: recordingResult.uri,
        imageFile: imageFile ? { uri: imageFile.uri, name: imageFile.name, type: imageFile.type } : null,
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total && progressEvent.total > 0) {
            setUploadProgress(Math.min(progressEvent.loaded / progressEvent.total, 0.99));
          }
        },
      });
      setUploadProgress(1);
      router.back();
    } catch (err) {
      setUploadProgress(0);
    }
  });

  const isUploading = recordEpisode.isPending;
  const uploadPercentage = Math.round(uploadProgress * 100);

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.colors.background }]}>
      <View style={s.topBar}>
        <IconButton
          icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
          onPress={() => {
            if (recordingResult || recordingStatus !== 'idle') {
              Alert.alert("Discard Recording?", "Going back will discard your current recording.", [
                { text: "Cancel", style: "cancel" },
                { text: "Discard", style: "destructive", onPress: () => router.back() }
              ]);
            } else {
              router.back();
            }
          }}
        />
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          Record Episode
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          
          {/* Step 1: Recording */}
          <View style={s.stepHeader}>
            <View style={[s.stepBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: Palette.white.pure, fontWeight: '800', fontSize: 13 }}>1</Text>
            </View>
            <Text variant="titleSmall" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
              Record Audio
            </Text>
          </View>

          <Surface style={[s.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]} elevation={0}>
            {!recordingResult ? (
              <View style={s.studio}>
                <RecordingTimer durationSeconds={duration} isRecording={recordingStatus === 'recording'} />
                <View style={{ marginTop: 24 }}>
                  <RecordingControls 
                    status={recordingStatus}
                    onStart={handleStart}
                    onPause={handlePause}
                    onResume={handleResume}
                    onStop={handleStop}
                  />
                </View>
              </View>
            ) : (
              <RecordingPreview 
                uri={recordingResult.uri} 
                durationSeconds={recordingResult.durationSeconds} 
                onRetake={handleRetake} 
              />
            )}
          </Surface>

          {/* Form appears only after recording is finished */}
          {recordingResult && (
            <View style={s.fadeIn}>
              <View style={[s.stepHeader, { marginTop: Spacing.xl }]}>
                <View style={[s.stepBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={{ color: Palette.white.pure, fontWeight: '800', fontSize: 13 }}>2</Text>
                </View>
                <Text variant="titleSmall" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
                  Episode Details
                </Text>
              </View>

              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} disabled={isUploading}>
                <Surface style={[s.uploadArea, { backgroundColor: Palette.light.surfaceVariant, borderColor: Palette.light.border, opacity: isUploading ? 0.7 : 1 }]} elevation={0}>
                  <IconButton icon="image" size={28} iconColor={theme.colors.primary} />
                  {imageFile ? (
                    <>
                      <Text variant="bodyMedium" style={{ color: theme.colors.primary, marginTop: 8, fontWeight: '600' }}>Image Selected</Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>{imageFile.name}</Text>
                    </>
                  ) : (
                    <>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>Tap to select cover image (Optional)</Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>JPG, PNG</Text>
                    </>
                  )}
                </Surface>
              </TouchableOpacity>

              <FormInput name="title" control={control} label="Episode Title" autoCapitalize="words" />

              <View style={{ marginBottom: Spacing.md }}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8, marginLeft: 4 }}>Select Podcast</Text>
                <Surface style={[s.podcastSelector, { backgroundColor: Palette.light.surface, borderColor: errors.podcastId ? theme.colors.error : Palette.light.border }]} elevation={0}>
                  <Menu
                    visible={podcastMenuVisible}
                    onDismiss={() => setPodcastMenuVisible(false)}
                    anchor={
                      <TouchableOpacity onPress={() => setPodcastMenuVisible(true)} style={s.podcastSelectorInner}>
                        <Text variant="bodyLarge" style={{ color: selectedPodcast ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                          {selectedPodcast ? selectedPodcast.title : "Choose a podcast..."}
                        </Text>
                        <ChevronDown size={20} color={theme.colors.onSurfaceVariant} />
                      </TouchableOpacity>
                    }
                    style={{ width: "90%", marginTop: 50 }}
                  >
                    {podcasts.length === 0 ? (
                      <Menu.Item title="No podcasts found. Create one first!" disabled />
                    ) : (
                      podcasts.map((p) => (
                        <Menu.Item key={p._id} onPress={() => { setValue("podcastId", p._id, { shouldValidate: true }); setPodcastMenuVisible(false); }} title={p.title} />
                      ))
                    )}
                  </Menu>
                </Surface>
                {errors.podcastId && <Text variant="labelSmall" style={{ color: theme.colors.error, marginTop: 4, marginLeft: 4 }}>{errors.podcastId.message}</Text>}
              </View>

              <FormInput name="description" control={control} label="Description" placeholder="Episode summary" multiline numberOfLines={4} />

              {isUploading && (
                <View style={{ marginTop: Spacing.lg }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.xs }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Publishing...</Text>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: "600" }}>{uploadPercentage}%</Text>
                  </View>
                  <ProgressBar progress={uploadProgress} color={theme.colors.primary} style={{ height: 6, borderRadius: Radius.md }} />
                </View>
              )}

              <Button
                mode="contained"
                onPress={onSubmit}
                loading={isUploading}
                disabled={isUploading}
                style={[s.submitBtn, { backgroundColor: theme.colors.primary }]}
                contentStyle={{ height: 52 }}
                labelStyle={{ fontSize: 16, fontWeight: "600" }}
              >
                {isUploading ? `Publishing... ${uploadPercentage}%` : "Publish Episode"}
              </Button>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.xs },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, marginTop: Spacing.xs },
  stepBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderRadius: Radius.xl, overflow: 'hidden', paddingVertical: Spacing.xl },
  studio: { alignItems: 'center' },
  uploadArea: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  podcastSelector: { borderWidth: 1, borderRadius: Radius.md, overflow: "hidden" },
  podcastSelectorInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.xl },
  fadeIn: { opacity: 1 },
});
