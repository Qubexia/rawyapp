'use client';

import { CreatePodcastForm } from '@/components/podcast/CreatePodcastForm';
import { useRouter } from 'next/navigation';

export default function CreatePodcastPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/podcasts');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New Podcast</h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the details below to create a new podcast. Your podcast will start in draft status.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <CreatePodcastForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
