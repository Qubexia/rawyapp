'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Podcast, PodcastCategory } from '@/types/podcast';

interface EditPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: Podcast | null;
  onSave: (id: string, data: Partial<Podcast>) => Promise<void>;
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

  useEffect(() => {
    if (podcast) {
      setTitle(podcast.title);
      setDescription(podcast.description);
      setCategory(podcast.category || '');
      setStatus(podcast.status || 'draft');
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setStatus('draft');
    }
  }, [podcast]);

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
      });
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
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select 
            value={status} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as 'draft' | 'published')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
