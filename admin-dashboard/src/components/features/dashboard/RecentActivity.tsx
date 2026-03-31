'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { useAnalyticsOverview } from '../../../hooks/useAnalytics';
import { Users, Podcast, Radio } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

interface UserData {
  _id: string;
  name?: string;
  email?: string;
  createdAt?: string;
}

interface PodcastData {
  _id: string;
  title: string;
  createdAt?: string;
}

interface EpisodeData {
  _id: string;
  title: string;
  createdAt?: string;
}

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  text: string;
  time: string;
  color: string;
}

export function RecentActivity() {
  const { data, isLoading, error } = useAnalyticsOverview();

  if (isLoading) {
    return (
      <Card className="col-span-1 border-gray-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="col-span-1 border-gray-200">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Failed to load activity.</p>
        </CardContent>
      </Card>
    );
  }

  const activities: ActivityItem[] = [];

  if (data.recentUsers) {
    data.recentUsers.forEach((u: UserData) => {
      activities.push({
        id: `user-${u._id}`,
        icon: Users,
        text: `New user: ${u.name || u.email}`,
        time: u.createdAt || '',
        color: 'text-blue-500',
      });
    });
  }

  if (data.recentPodcasts) {
    data.recentPodcasts.forEach((p: PodcastData) => {
      activities.push({
        id: `podcast-${p._id}`,
        icon: Podcast,
        text: `New podcast: ${p.title}`,
        time: p.createdAt || '',
        color: 'text-purple-500',
      });
    });
  }

  if (data.recentEpisodes) {
    data.recentEpisodes.forEach((e: EpisodeData) => {
      activities.push({
        id: `episode-${e._id}`,
        icon: Radio,
        text: `New episode: ${e.title}`,
        time: e.createdAt || '',
        color: 'text-orange-500',
      });
    });
  }

  // Sort by time descending
  activities.sort((a, b) => {
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });

  const displayActivities = activities.slice(0, 10);

  return (
    <Card className="col-span-1 border-gray-200">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {displayActivities.map(activity => (
              <div key={activity.id} className="flex items-center space-x-4">
                <activity.icon className={`h-4 w-4 flex-shrink-0 ${activity.color}`} />
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time ? timeAgo(activity.time) : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
