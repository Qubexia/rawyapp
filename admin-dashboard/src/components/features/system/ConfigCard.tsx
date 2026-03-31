'use client';

import { useSystemConfig } from '@/hooks/useSystemHealth';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Settings, Check, X } from 'lucide-react';

export function SystemConfigCard() {
  const { data, isLoading, error } = useSystemConfig();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
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
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Failed to load system configuration</div>
        </CardContent>
      </Card>
    );
  }

  const features = data?.features || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          System Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Application</p>
              <p className="font-medium">{data?.appName || '-'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Version</p>
              <p className="font-medium">{data?.version || '-'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Environment</p>
              <p className="font-medium">{data?.environment || '-'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">API Prefix</p>
              <p className="font-medium">{data?.apiPrefix || '-'}</p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-3">Feature Flags</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {value ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}