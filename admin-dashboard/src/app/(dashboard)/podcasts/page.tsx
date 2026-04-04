'use client';

import React, { useState } from 'react';
import { usePodcasts, Podcast } from '../../../hooks/usePodcasts';
import { PodcastTable } from '../../../components/features/podcasts/PodcastTable';
import { PodcastFilters } from '../../../components/features/podcasts/PodcastFilters';
import { PodcastModal } from '../../../components/features/podcasts/PodcastModal';
import { adminPodcastService } from '../../../services/adminPodcastService';
import { UpdatePodcastDto } from '../../../types/podcast';

export default function PodcastsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error, refetch, deletePodcast } = usePodcasts(page, 20, search || undefined, category || undefined);

  const handleEdit = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPodcast(null);
    setIsModalOpen(false);
  };

  const handleSavePodcast = async (id: string, updateData: UpdatePodcastDto, imageFile?: File | null) => {
    if (imageFile) {
      // Use multipart/form-data upload when image file is provided
      await adminPodcastService.updateWithImage(id, updateData, imageFile);
    } else {
      // Use regular JSON PATCH for metadata-only changes
      await adminPodcastService.update(id, updateData);
    }
    // Refetch the podcasts list to reflect the changes
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this podcast?")) {
      await deletePodcast(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Podcasts</h1>
      </div>

      <PodcastFilters search={search} setSearch={setSearch} category={category} setCategory={setCategory} />

      {error && <div className="text-red-500">Failed to load podcasts</div>}
      
      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <PodcastTable 
            podcasts={data?.data || []} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing page {data?.page} of {data?.totalPages || 1} ({data?.total || 0} total podcasts)
            </span>
            <div className="flex space-x-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={!data || page >= data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <PodcastModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        podcast={selectedPodcast} 
        onSave={handleSavePodcast}
      />
    </div>
  );
}
