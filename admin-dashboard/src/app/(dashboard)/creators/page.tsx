'use client';

import React, { useState } from 'react';
import { useCreators } from '../../../hooks/useCreators';
import { CreatorTable } from '../../../components/features/creators/CreatorTable';

export default function CreatorsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, deleteCreator } = useCreators(page, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Creators</h1>
      </div>

      {error && <div className="text-red-500">Failed to load creators</div>}
      
      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <CreatorTable 
            creators={data?.data || []} 
            onDelete={(id) => deleteCreator(id)}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing page {data?.page} of {data?.totalPages || 1} ({data?.total || 0} total creators)
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
