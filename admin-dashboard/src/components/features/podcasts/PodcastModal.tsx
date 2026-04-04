'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Podcast } from '../../../hooks/usePodcasts';
import { UpdatePodcastDto, PodcastCategory } from '../../../types/podcast';

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: Podcast | null;
  onSave: (id: string, data: UpdatePodcastDto, imageFile?: File | null) => Promise<void>;
}

export function PodcastModal({ isOpen, onClose, podcast, onSave }: PodcastModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PodcastCategory | ''>('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (podcast) {
      setTitle(podcast.title);
      setDescription(podcast.description);
      setCategory((podcast.category || '') as PodcastCategory | '');
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
      setImageFile(null);
      setImagePreview(null);
    }
  }, [podcast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Generate local preview
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
      await onSave(podcast._id, { title, description, category: category || undefined }, imageFile);
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
        <Input label="Title" value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} required />
        
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea 
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            required
            className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select 
            value={category} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as PodcastCategory | '')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Health">Health</option>
            <option value="Business">Business</option>
            <option value="Comedy">Comedy</option>
            <option value="Science">Science</option>
            <option value="Culture">Culture</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Cover Image Upload */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Cover Image</label>
          
          {imagePreview && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={imagePreview} 
                alt="Cover preview" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
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
