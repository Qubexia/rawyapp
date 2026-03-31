'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreatePodcast } from '@/hooks/usePodcast';
import { CreatePodcastDto, PodcastCategory } from '@/types/podcast';

const CATEGORIES: PodcastCategory[] = [
  'Technology',
  'Business',
  'Comedy',
  'Education',
  'Health',
  'Science',
  'Culture',
  'Sports',
];

interface CreatePodcastFormProps {
  onSuccess?: (podcast: unknown) => void;
}

export function CreatePodcastForm({ onSuccess }: CreatePodcastFormProps) {
  const [formData, setFormData] = useState<CreatePodcastDto>({
    title: '',
    description: '',
    category: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createPodcast, isLoading, isSuccess, isError, error } = useCreatePodcast();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    createPodcast(formData, {
      onSuccess: (data) => {
        onSuccess?.(data);
        setFormData({ title: '', description: '', category: undefined });
      },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        label="Podcast Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter podcast title"
        error={errors.title}
        required
      />

      <div className="flex flex-col space-y-1.5 w-full">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter podcast description (min 10 characters)"
          rows={4}
          className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
        {errors.description && (
          <span className="text-sm text-red-500">{errors.description}</span>
        )}
      </div>

      <div className="flex flex-col space-y-1.5 w-full">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={formData.category || ''}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {error || 'Failed to create podcast'}</p>
        </div>
      )}

      {isSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">Podcast created successfully!</p>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Podcast'}
      </Button>
    </form>
  );
}
