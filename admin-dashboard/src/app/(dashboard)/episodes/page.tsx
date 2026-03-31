'use client';

import React, { useState } from 'react';
import { useEpisodes } from '../../../hooks/useEpisodes';
import { EpisodeTable } from '../../../components/features/episodes/EpisodeTable';
import { Input } from '../../../components/ui/Input';

export default function EpisodesPage() {
  const [page, setPage] = useState(1);
  const [podcastId, setPodcastId] = useState('');
  const [creatorId, setCreatorId] = useState('');

  const { data, isLoading, error, deleteEpisode } = useEpisodes(page, 20, podcastId || undefined, creatorId || undefined);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this episode? Everything inside it will be cascaded.")) {
      await deleteEpisode(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Episodes</h1>
      </div>

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
    </div>
  );
}
