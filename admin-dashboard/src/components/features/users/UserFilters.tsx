import React from 'react';
import { Input } from '../../ui/Input';

interface UserFiltersProps {
  role: string;
  setRole: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
}

export function UserFilters({ role, setRole, search, setSearch }: UserFiltersProps) {
  return (
    <div className="flex gap-4 mb-4">
      <Input 
        placeholder="Search users... (disabled in mock)" 
        value={search} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
        className="max-w-xs" 
        disabled
      />
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="user-role-filter" className="sr-only">Filter by role</label>
        <select 
          id="user-role-filter"
          value={role} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
          className="flex h-10 w-full sm:w-[200px] rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="CREATOR">Creator</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
    </div>
  );
}
