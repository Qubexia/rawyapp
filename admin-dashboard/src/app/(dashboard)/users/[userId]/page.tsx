'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '../../../../hooks/useUsers';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-gray-200 rounded-xl"></div>;
  }

  if (error || !user) {
    return <div className="text-red-500">User not found or failed to load.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>← Back to Users</Button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold text-gray-500 block text-sm">ID</span>
            <span className="text-gray-900">{user._id}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Name</span>
            <span className="text-gray-900">{user.name}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Email</span>
            <span className="text-gray-900">{user.email}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Role</span>
            <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'CREATOR' ? 'info' : 'default'} className="mt-1">
              {user.role}
            </Badge>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Status</span>
            <Badge variant={user.isActive ? 'success' : 'warning'} className="mt-1">
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Joined At</span>
            <span className="text-gray-900">{new Date(user.createdAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
