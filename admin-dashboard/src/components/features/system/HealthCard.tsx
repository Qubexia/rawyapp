'use client';

import { useSystemHealth } from '@/hooks/useSystemHealth';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Activity, Server, Clock } from 'lucide-react';

export function SystemHealthCard() {
  const { data, isLoading, error } = useSystemHealth();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Failed to load system health</div>
        </CardContent>
      </Card>
    );
  }

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="flex items-center gap-2 font-medium">
              <Server className="w-4 h-4" />
              Status
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {data?.status || 'healthy'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Uptime</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {data ? formatUptime(data.uptime) : '-'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Node Version</p>
              <p className="font-medium">{data?.nodeVersion || '-'}</p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Memory Usage</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>RSS:</span>
                <span className="font-medium">{data ? formatBytes(data.memory.rss) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Heap Total:</span>
                <span className="font-medium">{data ? formatBytes(data.memory.heapTotal) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Heap Used:</span>
                <span className="font-medium">{data ? formatBytes(data.memory.heapUsed) : '-'}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : '-'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}