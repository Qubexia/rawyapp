'use client';

import { useState } from 'react';
import { AnalyticsOverview } from '@/components/features/analytics/Overview';
import { TopEpisodesChart } from '@/components/features/analytics/TopEpisodes';
import { TopCreatorsChart } from '@/components/features/analytics/TopCreators';

type TabType = 'overview' | 'episodes' | 'creators';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'episodes', label: 'Top Episodes' },
    { id: 'creators', label: 'Top Creators' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && <AnalyticsOverview />}
        {activeTab === 'episodes' && <TopEpisodesChart />}
        {activeTab === 'creators' && <TopCreatorsChart />}
      </div>
    </div>
  );
}