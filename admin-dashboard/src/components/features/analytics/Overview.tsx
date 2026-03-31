'use client';

import { Users, Mic, Headphones, FileAudio } from 'lucide-react';
import { useAnalyticsOverview } from '@/hooks/useAnalytics';

export function AnalyticsOverview() {
  const { data, isLoading, error } = useAnalyticsOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load analytics overview</div>;
  }

  const stats = [
    { label: 'Total Users', value: data?.users ?? 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Creators', value: data?.creators ?? 0, icon: Mic, color: 'bg-purple-500' },
    { label: 'Total Podcasts', value: data?.podcasts ?? 0, icon: Headphones, color: 'bg-green-500' },
    { label: 'Total Episodes', value: data?.episodes ?? 0, icon: FileAudio, color: 'bg-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}