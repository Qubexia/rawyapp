'use client';

import { useHealthCheck, HealthConnectionStatus } from '@/hooks/useHealthCheck';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function ConnectionStatus({ className = '', showLabel = true }: ConnectionStatusProps) {
  const { status, refetch } = useHealthCheck(30000);

  const statusConfig = {
    connected: {
      icon: Wifi,
      label: 'Connected',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    disconnected: {
      icon: WifiOff,
      label: 'Disconnected',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    checking: {
      icon: Loader2,
      label: 'Checking...',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  };

  const config = statusConfig[status as HealthConnectionStatus];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${className}`}
      onClick={() => refetch()}
      title="Click to check connection"
    >
      <Icon className={`h-4 w-4 ${config.color} ${status === 'checking' ? 'animate-spin' : ''}`} />
      {showLabel && <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>}
    </div>
  );
}
