'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Podcast, PodcastCategory } from '@/types/podcast';

interface EditPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: Podcast | null;
  onSave: (id: string, data: Partial<Podcast>, imageFile?: File | null) => Promise<void>;
}

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

export function EditPodcastModal({ isOpen, onClose, podcast, onSave }: EditPodcastModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PodcastCategory | ''>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (podcast) {
      setTitle(podcast.title);
      setDescription(podcast.description);
      setCategory(podcast.category || '');
      setStatus(podcast.status || 'draft');
      setImageFile(null);
      // Show existing cover image as preview
      if (podcast.coverImageUrl) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
        setImagePreview(`${baseUrl}/${podcast.coverImageUrl}`);
      } else {
        setImagePreview(null);
      }
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setStatus('draft');
      setImageFile(null);
      setImagePreview(null);
    }
  }, [podcast]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podcast) return;
    setLoading(true);
    try {
      await onSave(podcast.id, {
        title,
        description,
        category: category || undefined,
        status,
      }, imageFile);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Podcast">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
        />
        
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="edit-podcast-description" className="text-sm font-medium text-gray-700">Description</label>
          <textarea 
            id="edit-podcast-description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            required
            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="edit-podcast-category" className="text-sm font-medium text-gray-700">Category</label>
          <select 
            id="edit-podcast-category"
            value={category} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as PodcastCategory)}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label htmlFor="edit-podcast-status" className="text-sm font-medium text-gray-700">Status</label>
          <select 
            id="edit-podcast-status"
            value={status} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as 'draft' | 'published')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Cover Image Upload */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Cover Image</label>
          
          {imagePreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={imagePreview} 
                alt={`${title} cover image`} 
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <p className="text-xs text-gray-400">Accepts JPEG, PNG, WebP. Max 100MB.</p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
