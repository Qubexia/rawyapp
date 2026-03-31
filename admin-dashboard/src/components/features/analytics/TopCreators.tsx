'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTopCreators } from '@/hooks/useAnalytics';

export function TopCreatorsChart() {
  const { data, isLoading, error } = useTopCreators(10);

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 h-80 rounded-lg"></div>;
  }

  if (error) {
    return <div className="text-red-500">Failed to load top creators</div>;
  }

  const chartData = (data || []).map((creator) => ({
    name: creator.showName.length > 20 ? creator.showName.substring(0, 20) + '...' : creator.showName,
    followers: creator.followerCount,
    podcasts: creator.podcastCount,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Top Creators</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip />
            <Bar dataKey="followers" fill="#8B5CF6" name="Followers" />
            <Bar dataKey="podcasts" fill="#10B981" name="Podcasts" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Followers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Podcasts</span>
        </div>
      </div>
    </div>
  );
}