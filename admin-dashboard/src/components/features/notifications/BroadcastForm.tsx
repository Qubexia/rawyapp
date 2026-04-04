'use client';

import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { useBroadcastNotification, useBroadcastByRole } from '@/hooks/useNotifications';
import { Send } from 'lucide-react';

export function BroadcastForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [successMessage, setSuccessMessage] = useState('');

  const broadcastMutation = useBroadcastNotification();
  const broadcastByRoleMutation = useBroadcastByRole();

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    try {
      if (targetRole === 'ALL') {
        await broadcastMutation.mutateAsync({ title, body });
      } else {
        await broadcastByRoleMutation.mutateAsync({ title, body, targetRole });
      }
      setSuccessMessage(`Notification sent successfully to all ${targetRole === 'ALL' ? 'users' : targetRole.toLowerCase() + 's'}!`);
      setTitle('');
      setBody('');
    } catch (error) {
      console.error('Failed to send broadcast:', error);
    }
  };

  const isLoading = broadcastMutation.isPending || broadcastByRoleMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Broadcast Notification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter notification message"
              rows={4}
              required
            />
          </div>

          <div>
            <label htmlFor="broadcast-target" className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience
            </label>
            <select
              id="broadcast-target"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option value="ALL">All Users</option>
              <option value="USER">Regular Users Only</option>
              <option value="CREATOR">Creators Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Sending...' : 'Send Notification'}
          </Button>

          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          {broadcastMutation.isError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              Failed to send notification. Please try again.
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}