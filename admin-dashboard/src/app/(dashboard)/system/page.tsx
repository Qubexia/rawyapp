'use client';

import { SystemHealthCard } from '@/components/features/system/HealthCard';
import { SystemConfigCard } from '@/components/features/system/ConfigCard';

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealthCard />
        <SystemConfigCard />
      </div>
    </div>
  );
}