'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePodcast } from '@/hooks/usePodcasts';
import { useAdminEpisodes } from '@/hooks/useAdminEpisodes';
import { CreateEpisodeForm } from '@/components/episode/CreateEpisodeForm';

export default function CreateEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.podcastId as string;

  const { data: podcast, isLoading: podcastLoading } = usePodcast(podcastId);
  const { createEpisode } = useAdminEpisodes();

  const handleSubmit = async (data: {
    title: string;
    description: string;
    podcastId: string;
    duration?: number;
    audioFile: File;
    imageFile?: File | null;
    onUploadProgress?: (progressEvent: any) => void;
  }) => {
    await createEpisode(data);
    router.push('/episodes');
  };

  const handleCancel = () => {
    router.back();
  };

  if (podcastLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Episode</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload an audio file to create a new episode. The episode will be attributed to the podcast&apos;s original creator.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <CreateEpisodeForm
          podcastId={podcastId}
          podcastTitle={podcast?.title || 'Loading...'}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
