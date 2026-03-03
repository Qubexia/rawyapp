import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

// Allowed audio file types
export const AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
];

// Allowed image file types
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Generate a unique filename with UUID and original extension
 */
export const generateFileName = (req: any, file: any, cb: any) => {
  const uniqueSuffix = uuidv4();
  const ext = extname(file.originalname);
  cb(null, `${uniqueSuffix}${ext}`);
};

/**
 * File filter for audio files
 */
export const audioFileFilter = (
  req: any,
  file: any,
  cb: any,
) => {
  if (AUDIO_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed audio types: ${AUDIO_MIME_TYPES.join(', ')}`,
      ),
      false,
    );
  }
};

/**
 * File filter for image files
 */
export const imageFileFilter = (
  req: any,
  file: any,
  cb: any,
) => {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed image types: ${IMAGE_MIME_TYPES.join(', ')}`,
      ),
      false,
    );
  }
};

/**
 * Get Multer disk storage configuration for audio uploads
 */
export const getAudioStorage = () => {
  return diskStorage({
    destination: './uploads/audio',
    filename: generateFileName,
  });
};

/**
 * Get Multer disk storage configuration for image uploads
 */
export const getImageStorage = () => {
  return diskStorage({
    destination: './uploads/images',
    filename: generateFileName,
  });
};

/**
 * Get Multer configuration for audio uploads
 */
export const getAudioMulterConfig = (maxFileSize: number) => {
  return {
    storage: getAudioStorage(),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: audioFileFilter,
  };
};

/**
 * Get Multer configuration for image uploads
 */
export const getImageMulterConfig = (maxFileSize: number) => {
  return {
    storage: getImageStorage(),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: imageFileFilter,
  };
};
