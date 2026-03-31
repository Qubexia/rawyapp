'use client';

import React, { useState } from 'react';
import { useComments } from '../../../hooks/useComments';
import { CommentTable } from '../../../components/features/comments/CommentTable';
import { Input } from '../../../components/ui/Input';

export default function CommentsPage() {
  const [page, setPage] = useState(1);
  const [episodeId, setEpisodeId] = useState('');

  const { data, isLoading, error, deleteComment } = useComments(page, 20, episodeId || undefined);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this comment? This will also remove any nested replies!")) {
      await deleteComment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Comment Moderation</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <Input 
          placeholder="Filter by Episode ID..." 
          value={episodeId} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEpisodeId(e.target.value);
            setPage(1); // reset to page 1 on filter
          }} 
          className="max-w-[300px]" 
        />
      </div>

      {error && <div className="text-red-500">Failed to load comments</div>}
      
      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <CommentTable 
            comments={data?.data || []} 
            onDelete={handleDelete}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing page {data?.page} of {data?.totalPages || 1} ({data?.total || 0} total comments)
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
