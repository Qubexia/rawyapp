'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateEpisode } from '@/hooks/useEpisode';
import { CreateEpisodeDto } from '@/types/episode';

interface CreateEpisodeFormProps {
  podcastId: string;
  onSuccess?: (episode: unknown) => void;
}

export function CreateEpisodeForm({ podcastId, onSuccess }: CreateEpisodeFormProps) {
  const [formData, setFormData] = useState<CreateEpisodeDto>({
    title: '',
    description: '',
    audioFileUrl: '',
    duration: undefined,
    podcastId,
    imageUrl: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createEpisode, isLoading, isSuccess, isError, error } = useCreateEpisode();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must not exceed 5000 characters';
    }

    if (!formData.audioFileUrl) {
      newErrors.audioFileUrl = 'Audio file URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    createEpisode(formData, {
      onSuccess: (data) => {
        onSuccess?.(data);
        setFormData({
          title: '',
          description: '',
          audioFileUrl: '',
          duration: undefined,
          podcastId,
          imageUrl: undefined,
        });
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Episode Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter episode title"
        error={errors.title}
        required
      />

      <div className="flex flex-col space-y-1.5 w-full">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter episode description (min 10 characters)"
          rows={4}
          className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        {errors.description && (
          <span className="text-sm text-red-500">{errors.description}</span>
        )}
      </div>

      <Input
        label="Audio File URL"
        name="audioFileUrl"
        type="url"
        value={formData.audioFileUrl}
        onChange={handleChange}
        placeholder="https://example.com/audio.mp3"
        error={errors.audioFileUrl}
        required
      />

      <Input
        label="Duration (seconds)"
        name="duration"
        type="number"
        value={formData.duration?.toString() || ''}
        onChange={handleChange}
        placeholder="Optional: duration in seconds"
      />

      <Input
        label="Cover Image URL (optional)"
        name="imageUrl"
        type="url"
        value={formData.imageUrl || ''}
        onChange={handleChange}
        placeholder="https://example.com/image.jpg"
      />

      {isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {error || 'Failed to create episode'}</p>
        </div>
      )}

      {isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">Episode created successfully!</p>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Episode'}
      </Button>
    </form>
  );
}
