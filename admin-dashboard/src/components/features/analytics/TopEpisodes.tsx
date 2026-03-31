'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTopEpisodes } from '@/hooks/useAnalytics';

export function TopEpisodesChart() {
  const { data, isLoading, error } = useTopEpisodes(10);

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 h-80 rounded-lg"></div>;
  }

  if (error) {
    return <div className="text-red-500">Failed to load top episodes</div>;
  }

  const chartData = (data || []).map((episode) => ({
    name: episode.title.length > 20 ? episode.title.substring(0, 20) + '...' : episode.title,
    views: episode.viewsCount,
    likes: episode.likesCount,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Top Episodes</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip />
            <Bar dataKey="views" fill="#3B82F6" name="Views" />
            <Bar dataKey="likes" fill="#F59E0B" name="Likes" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Views</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span>Likes</span>
        </div>
      </div>
    </div>
  );
}