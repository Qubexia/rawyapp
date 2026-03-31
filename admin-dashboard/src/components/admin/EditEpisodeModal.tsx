'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Episode } from '@/types/episode';

interface EditEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode | null;
  onSave: (id: string, data: Partial<Episode>) => Promise<void>;
}

export function EditEpisodeModal({ isOpen, onClose, episode, onSave }: EditEpisodeModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (episode) {
      setTitle(episode.title);
      setDescription(episode.description);
      setDuration(episode.duration?.toString() || '');
    } else {
      setTitle('');
      setDescription('');
      setDuration('');
    }
  }, [episode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!episode) return;
    setLoading(true);
    try {
      await onSave(episode.id, {
        title,
        description,
        duration: duration ? parseInt(duration, 10) : undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Episode">
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

        <Input
          label="Duration (seconds)"
          type="number"
          value={duration}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(e.target.value)}
          placeholder="Duration in seconds"
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}
