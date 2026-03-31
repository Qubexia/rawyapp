'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Users, UserCircle, Podcast, Radio } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';

interface StatsResponse {
  users: number;
  creators: number;
  podcasts: number;
  episodes: number;
}

export function StatsCards() {
  const { data, isLoading, error } = useQuery<StatsResponse>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-500 text-sm font-medium">Failed to load statistics. Backend might be unreachable.</div>;
  }

  const items = [
    { title: 'Total Users', value: data.users ?? 0, icon: Users, color: 'text-blue-600' },
    { title: 'Total Creators', value: data.creators ?? 0, icon: UserCircle, color: 'text-green-600' },
    { title: 'Total Podcasts', value: data.podcasts ?? 0, icon: Podcast, color: 'text-purple-600' },
    { title: 'Total Episodes', value: data.episodes ?? 0, icon: Radio, color: 'text-orange-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
