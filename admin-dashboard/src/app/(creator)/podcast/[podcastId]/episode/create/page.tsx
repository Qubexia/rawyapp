'use client';

import { CreateEpisodeForm } from '@/components/episode/CreateEpisodeForm';
import { useRouter, useParams } from 'next/navigation';

export default function CreateEpisodePage() {
  const router = useRouter();
  const params = useParams();
  const podcastId = params.podcastId as string;

  const handleSuccess = () => {
    router.push(`/podcast/${podcastId}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Episode</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a new episode to your podcast. Enter the audio file URL and details below.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <CreateEpisodeForm podcastId={podcastId} onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
