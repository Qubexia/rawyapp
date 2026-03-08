/**
 * Upload Episode screen — form with React Hook Form + Zod.
 */

import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Button,
  IconButton,
  Surface,
  useTheme,
  Menu,
  ProgressBar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, Music, ChevronDown, Sparkles, CheckCircle2, FileAudio } from "lucide-react-native";
import { FormInput } from "@/components/ui";
import {
  createEpisodeSchema,
  CreateEpisodeFormData,
} from "@/validation/episode.schemas";
import { useCreateEpisode } from "@/hooks/queries/use-episodes";
import { usePodcasts } from "@/hooks/queries/use-podcasts";
import { useMyCreatorProfile } from "@/hooks/queries/use-creators";
import { useAuthContext } from "@/context/auth-context";
import { Palette, Spacing, Radius } from "@/constants/theme";
import { isCreator } from "@/utils/roles";
import { pickImage as pickImageUtil } from "@/utils/image-picker";
import { extractAudioMetadata } from "@/utils/audio-metadata";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Lazy import to avoid crash when ExpoDocumentPicker native module is missing (Expo Go)
let DocumentPicker: typeof import("expo-document-picker") | null = null;
try {
  DocumentPicker = require("expo-document-picker");
} catch (e) {
  console.log(
    "[UploadEpisode] Note: Document picking will require a development build.",
  );
}

export default function UploadEpisodeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createEpisode = useCreateEpisode();
  const { user } = useAuthContext();

  React.useEffect(() => {
    if (user && !isCreator(user)) {
      router.replace("/(tabs)/profile" as any);
    }
  }, [user, router]);

  const [audioFile, setAudioFile] = React.useState<any>(null);
  const [titleAutoFilled, setTitleAutoFilled] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<
    import("@/utils/image-picker").SelectedImage | null
  >(null);
  const [podcastMenuVisible, setPodcastMenuVisible] = React.useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedDurationSec, setExtractedDurationSec] = React.useState<
    number | null
  >(null);
  const [durationExtractionFailed, setDurationExtractionFailed] =
    React.useState(false);

  const { data: creator } = useMyCreatorProfile({
    enabled: !!user && isCreator(user),
  });
  const { data: podcastsData } = usePodcasts({ creatorId: creator?._id }, {
    enabled: !!creator?._id,
  });
  const podcasts = podcastsData?.pages.flatMap((p) => p.data) || [];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEpisodeFormData>({
    resolver: zodResolver(createEpisodeSchema) as any,
    defaultValues: { title: "", description: "", podcastId: "" },
  });

  if (!user || !isCreator(user)) {
    return null;
  }

  const selectedPodcastId = watch("podcastId");
  const selectedPodcast = podcasts.find((p) => p._id === selectedPodcastId);
  const watchedTitle = watch("title");
  const autoFilledValue = React.useRef<string>('');

  // Clear the auto-filled badge as soon as the user edits the title manually
  React.useEffect(() => {
    if (titleAutoFilled && watchedTitle !== autoFilledValue.current) {
      setTitleAutoFilled(false);
    }
  }, [watchedTitle, titleAutoFilled]);

  const pickAudio = async () => {
    if (!DocumentPicker) {
      Alert.alert(
        "Unavailable",
        "Document picker requires a development build.",
      );
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "audio/mpeg",
          "audio/wav",
          "audio/x-m4a",
          "audio/mp4",
          "audio/aac",
          "audio/ogg",
          "audio/flac",
          "audio/x-flac",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileSize = asset.size ?? 0;
        const metadata = await extractAudioMetadata(
          asset.uri,
          asset.name,
          fileSize
        );

        if (!metadata.isValid) {
          Alert.alert("File Too Large", metadata.error ?? "Please select a smaller file.");
          return;
        }

        setAudioFile(asset);
        if (metadata.extractedTitle) {
          setValue("title", metadata.extractedTitle, { shouldValidate: true });
          autoFilledValue.current = metadata.extractedTitle;
          setTitleAutoFilled(true);
        } else {
          setTitleAutoFilled(false);
        }
        setExtractedDurationSec(metadata.durationSeconds);
        setDurationExtractionFailed(metadata.durationSeconds === null);
      }
    } catch (err) {
      console.error("Error picking audio file:", err);
    }
  };

  const pickImage = async () => {
    const image = await pickImageUtil();
    if (image) {
      setImageFile(image);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!audioFile) {
      alert("Please select an audio file.");
      return;
    }

    // Use the actual file sizes as the known total — much more accurate than
    // progressEvent.total which includes multipart/form-data framing overhead
    // that can inflate the reported total beyond the real byte count.
    const knownTotal: number =
      (audioFile.size ?? 0) +
      (imageFile ? ((imageFile as any).fileSize ?? 0) : 0);

    setUploadProgress(0);
    try {
      // Prefer extracted duration; fallback to document-picker duration
      const durationSec =
        extractedDurationSec ??
        (audioFile?.duration ? Math.round(audioFile.duration / 1000) : undefined);

      await createEpisode.mutateAsync({
        data: { ...data, duration: durationSec },
        audioFile: {
          uri: audioFile.uri,
          name: audioFile.name,
          type: audioFile.mimeType || "audio/mpeg",
        },
        imageFile: imageFile
          ? { uri: imageFile.uri, name: imageFile.name, type: imageFile.type }
          : null,
        onUploadProgress: (progressEvent) => {
          if (knownTotal > 0) {
            // Clamp to 0.99 — only reach 1.0 after the server responds (below)
            const ratio = Math.min(progressEvent.loaded / knownTotal, 0.99);
            setUploadProgress(ratio);
          } else if (progressEvent.total && progressEvent.total > 0) {
            // Fallback: use axios-reported total if file size unavailable
            setUploadProgress(
              Math.min(progressEvent.loaded / progressEvent.total, 0.99),
            );
          }
        },
      });
      // Upload finished — show 100%
      setUploadProgress(1);
      router.back();
    } catch {
      setUploadProgress(0);
    }
  });

  const isUploading = createEpisode.isPending;
  const uploadPercentage = Math.round(uploadProgress * 100);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView
      style={[s.root, { backgroundColor: theme.colors.background }]}
    >
      <View style={s.topBar}>
        <IconButton
          icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
          onPress={() => router.back()}
        />
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onBackground, fontWeight: "700" }}
        >
          Upload Episode
        </Text>
        <View style={{ width: 48 }} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={{ padding: Spacing.lg }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Step 1: Audio file picker ── */}
          <View style={s.stepHeader}>
            <View style={[s.stepBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>1</Text>
            </View>
            <Text variant="titleSmall" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
              Choose Audio File
            </Text>
          </View>
          <TouchableOpacity
            onPress={pickAudio}
            activeOpacity={0.8}
            disabled={isUploading}
          >
            <Surface
              style={[
                s.uploadArea,
                {
                  backgroundColor: audioFile ? Palette.primary[50] : Palette.light.surfaceVariant,
                  borderColor: audioFile ? theme.colors.primary : Palette.light.border,
                  borderStyle: audioFile ? 'solid' : 'dashed',
                  opacity: isUploading ? 0.7 : 1,
                },
              ]}
              elevation={0}
            >
              {audioFile ? (
                <>
                  <View style={[s.audioIconBox, { backgroundColor: theme.colors.primary }]}>
                    <FileAudio size={28} color="#FFF" />
                  </View>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.primary,
                      marginTop: Spacing.sm,
                      fontWeight: '700',
                      textAlign: 'center',
                    }}
                  >
                    {audioFile.name}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                  >
                    {audioFile.size ? (audioFile.size / (1024 * 1024)).toFixed(2) : 0} MB
                    {extractedDurationSec != null && <> · {formatDuration(extractedDurationSec)}</>}
                  </Text>
                  {durationExtractionFailed && (
                    <Text
                      variant="labelSmall"
                      style={{ color: theme.colors.onSurfaceVariant, marginTop: 4, fontStyle: 'italic' }}
                    >
                      Could not extract duration. Duration will be omitted.
                    </Text>
                  )}
                  <Text variant="labelSmall" style={{ color: theme.colors.primary, marginTop: Spacing.sm, fontWeight: '600' }}>
                    Tap to change
                  </Text>
                </>
              ) : (
                <>
                  <View style={[s.audioIconBox, { backgroundColor: Palette.primary[100] }]}>
                    <Upload size={28} color={Palette.primary[500]} />
                  </View>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurface, marginTop: Spacing.sm, fontWeight: '600' }}
                  >
                    Tap to select audio file
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                  >
                    MP3, M4A, WAV, OGG, FLAC
                  </Text>
                  <View style={[s.autoFillHint, { backgroundColor: Palette.primary[50], borderColor: Palette.primary[200] }]}>
                    <Sparkles size={13} color={Palette.primary[500]} />
                    <Text variant="labelSmall" style={{ color: Palette.primary[600], marginLeft: 6, fontWeight: '600', flex: 1 }}>
                      Episode title will be filled automatically from the file metadata
                    </Text>
                  </View>
                </>
              )}
            </Surface>
          </TouchableOpacity>

          {/* ── Step 2: Episode Info ── */}
          <View style={[s.stepHeader, { marginTop: Spacing.lg }]}>
            <View style={[s.stepBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 13 }}>2</Text>
            </View>
            <Text variant="titleSmall" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
              Episode Info
            </Text>
          </View>

          {/* Image file picker */}
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            disabled={isUploading}
          >
            <Surface
              style={[
                s.uploadArea,
                {
                  backgroundColor: Palette.light.surfaceVariant,
                  borderColor: Palette.light.border,
                  opacity: isUploading ? 0.7 : 1,
                },
              ]}
              elevation={0}
            >
              <IconButton
                icon="image"
                size={28}
                iconColor={theme.colors.primary}
              />
              {imageFile ? (
                <>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.primary,
                      marginTop: 8,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Image Selected
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 4,
                    }}
                  >
                    {imageFile.name}
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 8,
                    }}
                  >
                    Tap to select image (Optional)
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    JPG, PNG
                  </Text>
                </>
              )}
            </Surface>
          </TouchableOpacity>

          {/* Title with auto-fill indicator */}
          <View>
            <FormInput
              name="title"
              control={control}
              label="Episode Title"
              placeholder={audioFile ? 'Title extracted from file...' : 'Upload audio file first for auto-fill'}
              autoCapitalize="words"
              icon={
                titleAutoFilled
                  ? <CheckCircle2 size={20} color={theme.colors.primary} />
                  : <Music size={20} color={theme.colors.onSurfaceVariant} />
              }
            />
            {titleAutoFilled ? (
              <View style={s.autoFilledBadge}>
                <Sparkles size={12} color={Palette.primary[500]} />
                <Text variant="labelSmall" style={{ color: Palette.primary[600], marginLeft: 5, fontWeight: '600' }}>
                  Auto-filled from audio file — you can edit it
                </Text>
              </View>
            ) : !audioFile ? (
              <Text variant="labelSmall" style={[s.hintText, { color: theme.colors.onSurfaceVariant }]}>
                ✨ Title will be filled automatically after selecting the audio file
              </Text>
            ) : null}
          </View>

          <View style={{ marginBottom: Spacing.md }}>
            <Text
              variant="labelMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginBottom: 8,
                marginLeft: 4,
              }}
            >
              Select Podcast
            </Text>
            <Surface
              style={[
                s.podcastSelector,
                {
                  backgroundColor: Palette.light.surface,
                  borderColor: errors.podcastId
                    ? theme.colors.error
                    : Palette.light.border,
                },
              ]}
              elevation={0}
            >
              <Menu
                visible={podcastMenuVisible}
                onDismiss={() => setPodcastMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => setPodcastMenuVisible(true)}
                    style={s.podcastSelectorInner}
                  >
                    <Text
                      variant="bodyLarge"
                      style={{
                        color: selectedPodcast
                          ? theme.colors.onSurface
                          : theme.colors.onSurfaceVariant,
                      }}
                    >
                      {selectedPodcast
                        ? selectedPodcast.title
                        : "Choose a podcast..."}
                    </Text>
                    <ChevronDown
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                }
                style={{ width: "90%", marginTop: 50 }}
              >
                {podcasts.length === 0 ? (
                  <Menu.Item
                    title="No podcasts found. Create one first!"
                    disabled
                  />
                ) : (
                  podcasts.map((p) => (
                    <Menu.Item
                      key={p._id}
                      onPress={() => {
                        setValue("podcastId", p._id, { shouldValidate: true });
                        setPodcastMenuVisible(false);
                      }}
                      title={p.title}
                    />
                  ))
                )}
              </Menu>
            </Surface>
            {errors.podcastId && (
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.error,
                  marginTop: 4,
                  marginLeft: 4,
                }}
              >
                {errors.podcastId.message}
              </Text>
            )}
          </View>

          <FormInput
            name="description"
            control={control}
            label="Description"
            placeholder="Episode summary"
            multiline
            numberOfLines={4}
          />

          {/* Upload progress */}
          {isUploading && (
            <View style={{ marginTop: Spacing.lg }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: Spacing.xs,
                }}
              >
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Uploading...
                </Text>
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.primary, fontWeight: "600" }}
                >
                  {uploadPercentage}%
                </Text>
              </View>
              <ProgressBar
                progress={uploadProgress}
                color={theme.colors.primary}
                style={{ height: 6, borderRadius: Radius.md }}
              />
            </View>
          )}

          <Button
            mode="contained"
            onPress={onSubmit}
            loading={isUploading}
            disabled={isUploading || !audioFile}
            style={s.submitBtn}
            contentStyle={{ height: 52 }}
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
            icon={() =>
              isUploading ? null : <Upload size={18} color="#FFF" />
            }
          >
            {isUploading
              ? `Uploading... ${uploadPercentage}%`
              : "Upload Episode"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xs,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  podcastSelector: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  podcastSelectorInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIconBox: {
    width: 60,
    height: 60,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFillHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  autoFilledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  hintText: {
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
});
