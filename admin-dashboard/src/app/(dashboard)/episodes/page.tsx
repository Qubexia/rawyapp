'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEpisodes, Episode } from '../../../hooks/useEpisodes';
import { usePodcasts } from '../../../hooks/usePodcasts';
import { EpisodeTable } from '../../../components/features/episodes/EpisodeTable';
import { EditEpisodeModal } from '../../../components/admin/EditEpisodeModal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { adminEpisodeService } from '../../../services/adminEpisodeService';
import { UpdateEpisodeDto } from '../../../types/episode';

export default function EpisodesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [podcastId, setPodcastId] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPodcastPicker, setShowPodcastPicker] = useState(false);

  const { data, isLoading, error, refetch, deleteEpisode } = useEpisodes(page, 20, podcastId || undefined, creatorId || undefined);
  const { data: podcastsData } = usePodcasts(1, 100);

  const handleEdit = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedEpisode(null);
    setIsEditModalOpen(false);
  };

  const handleSaveEpisode = async (id: string, updateData: UpdateEpisodeDto, imageFile?: File | null) => {
    if (imageFile) {
      await adminEpisodeService.updateWithImage(id, updateData, imageFile);
    } else {
      await adminEpisodeService.update(id, updateData);
    }
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this episode? Everything inside it will be cascaded.")) {
      await deleteEpisode(id);
    }
  };

  const handleCreateEpisode = (podcastId: string) => {
    router.push(`/podcast/${podcastId}/episode/create`);
    setShowPodcastPicker(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Episodes</h1>
        <Button onClick={() => setShowPodcastPicker(!showPodcastPicker)}>
          + Create Episode
        </Button>
      </div>

      {/* Podcast Picker for Episode Creation */}
      {showPodcastPicker && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Select a podcast to add an episode to:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {podcastsData?.data?.map((podcast) => (
              <button
                key={podcast._id}
                onClick={() => handleCreateEpisode(podcast._id)}
                className="text-left px-3 py-2 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 truncate">{podcast.title}</p>
                <p className="text-xs text-gray-500">{podcast.episodeCount} episodes • {podcast.creator?.name || 'Unknown'}</p>
              </button>
            ))}
            {(!podcastsData?.data || podcastsData.data.length === 0) && (
              <p className="text-sm text-gray-500 col-span-full">No podcasts found. Create a podcast first.</p>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowPodcastPicker(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <Input 
          placeholder="Filter by Podcast ID..." 
          value={podcastId} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPodcastId(e.target.value)} 
          className="max-w-xs" 
        />
        <Input 
          placeholder="Filter by Creator ID..." 
          value={creatorId} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreatorId(e.target.value)} 
          className="max-w-xs" 
        />
      </div>

      {error && <div className="text-red-500">Failed to load episodes</div>}
      
      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <EpisodeTable 
            episodes={data?.data || []} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing page {data?.page} of {data?.totalPages || 1} ({data?.total || 0} total episodes)
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

      <EditEpisodeModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        episode={selectedEpisode as any}
        onSave={handleSaveEpisode}
      />
    </div>
  );
}
