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
import { ArrowLeft, Upload, Music, ChevronDown } from "lucide-react-native";
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
  const [imageFile, setImageFile] = React.useState<import('@/utils/image-picker').SelectedImage | null>(null);
  const [podcastMenuVisible, setPodcastMenuVisible] = React.useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: creator } = useMyCreatorProfile({
    enabled: !!user && isCreator(user),
  });
  const { data: podcastsData } = usePodcasts(creator?._id, {
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
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAudioFile(result.assets[0]);
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

    await createEpisode.mutateAsync({
      data,
      audioFile: {
        uri: audioFile.uri,
        name: audioFile.name,
        type: audioFile.mimeType || "audio/mpeg",
      },
      imageFile: imageFile
        ? { uri: imageFile.uri, name: imageFile.name, type: imageFile.type }
        : null,
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.loaded / progressEvent.total;
        setUploadProgress(progress);
      },
    });
    router.back();
  });

  const isUploading = createEpisode.isPending;
  const uploadPercentage = Math.round(uploadProgress * 100);

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

          <FormInput
            name="title"
            control={control}
            label="Episode Title"
            placeholder="e.g. Episode 1: Introduction"
            autoCapitalize="words"
            icon={<Music size={20} color={theme.colors.onSurfaceVariant} />}
          />

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

          {/* Audio file picker */}
          <TouchableOpacity
            onPress={pickAudio}
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
              <Upload size={28} color={theme.colors.primary} />
              {audioFile ? (
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
                    {audioFile.name}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 4,
                    }}
                  >
                    {audioFile.size
                      ? (audioFile.size / (1024 * 1024)).toFixed(2)
                      : 0}{" "}
                    MB
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
                    Tap to select audio file
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    MP3, M4A, WAV
                  </Text>
                </>
              )}
            </Surface>
          </TouchableOpacity>

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
    borderStyle: "dashed",
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  submitBtn: { borderRadius: Radius.md, marginTop: Spacing.lg },
});
