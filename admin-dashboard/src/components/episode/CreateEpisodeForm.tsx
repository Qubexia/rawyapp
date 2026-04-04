'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface UploadProgressEvent {
  loaded: number;
  total?: number;
}

interface CreateEpisodeFormProps {
  podcastId: string;
  podcastTitle?: string;
  onSubmit: (data: {
    title: string;
    description: string;
    podcastId: string;
    duration?: number;
    audioFile: File;
    imageFile?: File | null;
    onUploadProgress?: (progressEvent: UploadProgressEvent) => void;
  }) => Promise<void>;
  onCancel?: () => void;
}

const SUPPORTED_AUDIO_EXTENSIONS = ['mp3', 'm4a', 'wav', 'ogg', 'aac', 'flac'];
const SUPPORTED_IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'png', 'webp'];
const MAX_AUDIO_SIZE_MB = 500;
const MAX_IMAGE_SIZE_MB = 500;

/**
 * Form for creating a new episode via the admin dashboard.
 * Supports audio file upload with auto-title extraction from filename,
 * optional cover image upload, and metadata fields.
 */
export function CreateEpisodeForm({ podcastId, podcastTitle, onSubmit, onCancel }: CreateEpisodeFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  /**
   * Extract a clean title from the audio filename.
   * e.g. "Episode_01_-_Introduction_to_AI.mp3" → "Episode 01 - Introduction to AI"
   */
  const extractTitleFromFilename = (filename: string): string => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    return nameWithoutExt
      .replace(/[_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const validateAudioFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!SUPPORTED_AUDIO_EXTENSIONS.includes(ext)) {
      return `Unsupported audio format: .${ext}. Supported formats: ${SUPPORTED_AUDIO_EXTENSIONS.join(', ').toUpperCase()}`;
    }
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_AUDIO_SIZE_MB) {
      return `File too large (${sizeMB.toFixed(1)} MB). Maximum size: ${MAX_AUDIO_SIZE_MB} MB`;
    }
    return null;
  };

  const validateImageFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
      return `Unsupported image format: .${ext}. Supported formats: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ').toUpperCase()}`;
    }
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      return `File too large (${sizeMB.toFixed(1)} MB). Maximum size: ${MAX_IMAGE_SIZE_MB} MB`;
    }
    return null;
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateAudioFile(file);
    if (validationError) {
      setAudioError(validationError);
      setAudioFile(null);
      if (audioInputRef.current) audioInputRef.current.value = '';
      return;
    }

    setAudioError(null);
    setAudioFile(file);

    // Auto-fill title from filename if title is empty
    if (!title.trim()) {
      setTitle(extractTitleFromFilename(file.name));
    }
    
    // Extract duration
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration).toString());
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setImageError(validationError);
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    setImageError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    if (title.trim().length > 200) {
      setError('Title must be 200 characters or fewer');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    if (description.trim().length > 5000) {
      setError('Description must be 5,000 characters or fewer');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        podcastId,
        duration: duration ? parseInt(duration, 10) : undefined,
        audioFile,
        imageFile,
        onUploadProgress: (progressEvent: UploadProgressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });
      setSuccess(true);
      setUploadProgress(100);
      // Reset form
      setTitle('');
      setDescription('');
      setDuration('');
      setAudioFile(null);
      setAudioError(null);
      setImageFile(null);
      setImagePreview(null);
      setImageError(null);
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Failed to create episode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Podcast info */}
      {podcastTitle && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Creating episode for</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{podcastTitle}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm" role="status">
          Episode created successfully!
        </div>
      )}

      {/* Audio File Upload */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="episode-audio-file" className="text-sm font-medium text-gray-700">
          Audio File <span className="text-red-500">*</span>
        </label>
        <input
          id="episode-audio-file"
          ref={audioInputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/wav,audio/wave,audio/x-wav,audio/ogg,audio/aac"
          onChange={handleAudioChange}
          required
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        {audioError && (
          <p className="text-sm text-red-600" role="alert">{audioError}</p>
        )}
        {audioFile && !audioError && (
          <p className="text-xs text-green-600">
            ✓ {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)
          </p>
        )}
        <p className="text-xs text-gray-400">MP3, M4A, WAV, OGG, AAC. Max {MAX_AUDIO_SIZE_MB} MB.</p>
      </div>

      {/* Title (auto-filled from filename) */}
      <Input
        label="Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        required
        maxLength={200}
        placeholder="Auto-filled from filename, or enter manually"
      />

      {/* Description */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="episode-description" className="text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="episode-description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          placeholder="Enter episode description (min 10 characters)"
          className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-400">{description.length}/5,000 characters</p>
      </div>

      {/* Duration */}
      <Input
        label="Duration (seconds)"
        type="number"
        value={duration}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
        placeholder="Auto-calculated from audio file"
        min={0}
        max={86400}
      />

      {/* Cover Image Upload */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="episode-image-file" className="text-sm font-medium text-gray-700">Cover Image (optional)</label>

        {imagePreview && (
          <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={imagePreview}
              alt={`${title || 'Episode'} cover image`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              aria-label="Remove cover image"
            >
              ×
            </button>
          </div>
        )}

        {imageError && (
          <p className="text-sm text-red-600" role="alert">{imageError}</p>
        )}

        <input
          id="episode-image-file"
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/jng,image/png,image/webp"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        <p className="text-xs text-gray-400">JPEG, PNG, WebP. Max {MAX_IMAGE_SIZE_MB} MB.</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t items-center">
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="flex-1 flex flex-col items-end mr-4">
            <span className="text-xs font-semibold text-blue-600 mb-1">
              Uploading... {uploadProgress}%
            </span>
            <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !audioFile}>
          {loading ? 'Creating...' : 'Create Episode'}
        </Button>
      </div>
    </form>
  );
}
