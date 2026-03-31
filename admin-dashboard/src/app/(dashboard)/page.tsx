import React from 'react';
import { StatsCards } from '../../components/features/dashboard/StatsCards';
import { RecentActivity } from '../../components/features/dashboard/RecentActivity';
import { QuickActions } from '../../components/features/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
      </div>
      
      <StatsCards />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
