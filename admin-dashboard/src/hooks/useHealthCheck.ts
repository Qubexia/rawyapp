import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthService, HealthStatus } from '@/services/healthService';

export type HealthConnectionStatus = 'connected' | 'disconnected' | 'checking';

export function useHealthCheck(intervalMs: number = 30000) {
  const [status, setStatus] = useState<HealthConnectionStatus>('checking');

  const { data, isLoading, isError, refetch } = useQuery<HealthStatus>({
    queryKey: ['health'],
    queryFn: () => healthService.check(),
    retry: 1,
    staleTime: intervalMs,
    refetchInterval: intervalMs,
  });

  useEffect(() => {
    if (isLoading) {
      setStatus('checking');
    } else if (isError || !data) {
      setStatus('disconnected');
    } else if (data.status === 'ok') {
      setStatus('connected');
    } else {
      setStatus('disconnected');
    }
  }, [isLoading, isError, data]);

  return {
    status,
    isLoading,
    isError,
    data,
    refetch,
  };
}
