/**
 * Audio metadata extraction utility for episode upload.
 * Extracts title from file name and duration from audio file contents.
 */

const MAX_FILE_SIZE_BYTES = 524_288_000; // 500 MB
const MAX_TITLE_LENGTH = 200;
const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.aac', '.ogg', '.flac'];
const LOAD_TIMEOUT_MS = 5000;
const LOAD_POLL_INTERVAL_MS = 100;

export interface ExtractAudioMetadataResult {
  extractedTitle: string;
  durationSeconds: number | null;
  fileSizeBytes: number;
  isValid: boolean;
  error?: string;
}

/**
 * Cleans the file name by removing the extension, trimming whitespace, and truncating.
 */
function cleanFileName(fileName: string): string {
  let cleaned = fileName.trim();
  const lower = cleaned.toLowerCase();
  for (const ext of AUDIO_EXTENSIONS) {
    if (lower.endsWith(ext)) {
      cleaned = cleaned.slice(0, -ext.length).trim();
      break;
    }
  }
  return cleaned.length > MAX_TITLE_LENGTH
    ? cleaned.slice(0, MAX_TITLE_LENGTH)
    : cleaned;
}

/**
 * Extracts metadata from an audio file: validates size, cleans title, and reads duration.
 * Uses expo-audio's createAudioPlayer to load the file and read duration.
 */
export async function extractAudioMetadata(
  fileUri: string,
  fileName: string,
  fileSize: number
): Promise<ExtractAudioMetadataResult> {
  const extractedTitle = cleanFileName(fileName);

  // 1. Validate file size
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      extractedTitle,
      durationSeconds: null,
      fileSizeBytes: fileSize,
      isValid: false,
      error: `File size (${(fileSize / (1024 * 1024)).toFixed(1)} MB) exceeds the 500 MB limit.`,
    };
  }

  // 2. Load file to extract duration
  let durationSeconds: number | null = null;

  try {
    const { createAudioPlayer } = require('expo-audio');
    const player = createAudioPlayer(
      { uri: fileUri },
      { downloadFirst: true }
    );

    // Wait for the player to load (poll isLoaded)
    const loadStart = Date.now();
    while (!player.isLoaded && Date.now() - loadStart < LOAD_TIMEOUT_MS) {
      await new Promise((r) => setTimeout(r, LOAD_POLL_INTERVAL_MS));
    }

    if (player.isLoaded && player.duration > 0) {
      durationSeconds = Math.round(player.duration);
    }

    player.remove();
  } catch (err) {
    console.warn('[audio-metadata] Could not extract duration:', err);
    // Title extraction still succeeded; duration is null
  }

  return {
    extractedTitle,
    durationSeconds,
    fileSizeBytes: fileSize,
    isValid: true,
  };
}
