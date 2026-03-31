'use client';

import { useEpisodes } from '@/hooks/useEpisode';
import { Episode } from '@/types/episode';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PodcastDetailPage() {
  const params = useParams();
  const podcastId = params.podcastId as string;
  const [page, setPage] = useState(1);
  
  const { episodes, total, page: currentPage, totalPages, isLoading } = useEpisodes(podcastId, { page, limit: 10 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Podcast Episodes</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage episodes for this podcast
          </p>
        </div>
        <Link
          href={`/podcast/${podcastId}/episode/create`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Episode
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No episodes yet.</p>
          <Link
            href={`/podcast/${podcastId}/episode/create`}
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Add your first episode
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {episodes.map((episode: Episode) => (
              <div
                key={episode.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{episode.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{episode.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      {episode.duration && <span>{Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}</span>}
                      <span>{episode.viewsCount} views</span>
                      <span>{episode.likesCount} likes</span>
                      <span>{episode.commentsCount} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({total} total episodes)
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
