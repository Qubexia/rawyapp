/**
 * Storage configuration for local file uploads.
 * Audio and image files are stored in the `./uploads/` directory
 * relative to the backend root.
 */
export const STORAGE_CONFIG = {
  /** Root directory for all uploads */
  uploadsRoot: './uploads',

  /** Directory for audio files (episodes) */
  audioDir: './uploads/audio',

  /** Directory for image files (cover art, avatars) */
  imageDir: './uploads/images',

  /** Maximum audio file size in bytes (100 MB) */
  maxAudioFileSize: 100 * 1024 * 1024,

  /** Maximum image file size in bytes (5 MB) */
  maxImageFileSize: 5 * 1024 * 1024,

  /** Allowed audio MIME types */
  allowedAudioMimes: [
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/x-m4a',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/aac',
  ],

  /** Allowed image MIME types */
  allowedImageMimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const;
