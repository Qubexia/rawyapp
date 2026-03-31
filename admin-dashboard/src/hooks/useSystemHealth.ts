'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface SystemHealth {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  nodeVersion: string;
}

interface SystemConfig {
  appName: string;
  version: string;
  environment: string;
  apiPrefix: string;
  features: {
    userRegistration: boolean;
    creatorMode: boolean;
    notifications: boolean;
    analytics: boolean;
  };
}

export function useSystemHealth() {
  return useQuery<SystemHealth>({
    queryKey: ['system', 'health'],
    queryFn: () => api.get('/admin/system/health').then((res) => res.data),
    refetchInterval: 30000,
  });
}

export function useSystemConfig() {
  return useQuery<SystemConfig>({
    queryKey: ['system', 'config'],
    queryFn: () => api.get('/admin/system/config').then((res) => res.data),
  });
}