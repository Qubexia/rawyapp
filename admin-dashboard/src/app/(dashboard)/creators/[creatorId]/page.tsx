'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreator } from '../../../../hooks/useCreators';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.creatorId as string;

  const { data: creator, isLoading, error } = useCreator(creatorId);

  if (isLoading) {
    return <div className="animate-pulse h-40 bg-gray-200 rounded-xl"></div>;
  }

  if (error || !creator) {
    return <div className="text-red-500">Creator not found or failed to load.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>← Back to Creators</Button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Creator Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold text-gray-500 block text-sm">ID</span>
            <span className="text-gray-900">{creator._id}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">User ID</span>
            <span className="text-gray-900">{creator.userId}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Show Name</span>
            <span className="text-gray-900">{creator.showName}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Followers</span>
            <span className="text-gray-900">{creator.followerCount}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Podcasts Count</span>
            <span className="text-gray-900">{creator.podcastCount}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block text-sm">Status Acquired</span>
            <span className="text-gray-900">{new Date(creator.createdAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
