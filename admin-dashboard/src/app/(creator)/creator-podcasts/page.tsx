'use client';

import { usePodcasts } from '@/hooks/usePodcast';
import { Podcast } from '@/types/podcast';
import { useState } from 'react';
import Link from 'next/link';

export default function CreatorPodcastsPage() {
  const [page, setPage] = useState(1);
  const { podcasts, total, page: currentPage, totalPages, isLoading } = usePodcasts({ page, limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Podcasts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your podcasts and episodes
          </p>
        </div>
        <Link
          href="/podcast/create"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Create Podcast
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">You have not created any podcasts yet.</p>
          <Link
            href="/podcast/create"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Create your first podcast
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {podcasts.map((podcast: Podcast) => (
              <div
                key={podcast.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{podcast.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{podcast.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>{podcast.episodeCount} episodes</span>
                      {podcast.category && <span>{podcast.category}</span>}
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        podcast.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {podcast.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({total} total podcasts)
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
