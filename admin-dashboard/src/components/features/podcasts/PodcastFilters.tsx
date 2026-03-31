import React, { useEffect, useState } from 'react';
import { Input } from '../../ui/Input';

interface PodcastFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
}

export function PodcastFilters({ search, setSearch, category, setCategory }: PodcastFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Debounce search effect to avoid excessive queries
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch, setSearch]);

  return (
    <div className="flex gap-4 mb-4">
      <Input 
        placeholder="Search podcasts..." 
        value={localSearch} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalSearch(e.target.value)} 
        className="max-w-xs" 
      />
      <select 
        value={category} 
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
        className="flex h-10 w-[200px] rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Categories</option>
        <option value="Education">Education</option>
        <option value="Technology">Technology</option>
        <option value="Health">Health</option>
        <option value="Business">Business</option>
        <option value="Comedy">Comedy</option>
        <option value="Other">Other</option>
      </select>
    </div>
  );
}
