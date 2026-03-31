'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Bell, Clock } from 'lucide-react';

export function NotificationHistory() {
  const { data, isLoading, error } = useNotifications(1, 20);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Failed to load notification history</div>
        </CardContent>
      </Card>
    );
  }

  const notifications = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Broadcast History</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No broadcast notifications sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {notification.title || 'Broadcast Notification'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.body}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.sentAt).toLocaleString()}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {notification.targetRole || 'ALL'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}