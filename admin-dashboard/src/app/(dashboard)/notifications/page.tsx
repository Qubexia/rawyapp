'use client';

import { BroadcastForm } from '@/components/features/notifications/BroadcastForm';
import { NotificationHistory } from '@/components/features/notifications/History';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BroadcastForm />
        <NotificationHistory />
      </div>
    </div>
  );
}