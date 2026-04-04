'use client';

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
    onUploadProgress?: (progressEvent: any) => void;
  }) => Promise<void>;
  onCancel?: () => void;
}

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
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

    if (!description.trim() || description.trim().length < 10) {
      setError('Description must be at least 10 characters');
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
        onUploadProgress: (progressEvent: any) => {
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
      setImageFile(null);
      setImagePreview(null);
      if (audioInputRef.current) audioInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create episode');
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
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{podcastTitle}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          Episode created successfully!
        </div>
      )}

      {/* Audio File Upload */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Audio File <span className="text-red-500">*</span>
        </label>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/wav,audio/wave,audio/x-wav,audio/ogg,audio/aac"
          onChange={handleAudioChange}
          required
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        {audioFile && (
          <p className="text-xs text-green-600">
            ✓ {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)
          </p>
        )}
        <p className="text-xs text-gray-400">MP3, M4A, WAV, OGG, AAC. Max 500MB.</p>
      </div>

      {/* Title (auto-filled from filename) */}
      <Input
        label="Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        required
        placeholder="Auto-filled from filename, or enter manually"
      />

      {/* Description */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          required
          minLength={10}
          rows={4}
          placeholder="Enter episode description (min 10 characters)"
          className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Duration */}
      <Input
        label="Duration (seconds)"
        type="number"
        value={duration}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
        placeholder="Auto-calculated from audio file"
      />

      {/* Cover Image Upload */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Cover Image (optional)</label>

        {imagePreview && (
          <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={imagePreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        <p className="text-xs text-gray-400">JPEG, PNG, WebP. Max 500MB.</p>
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
