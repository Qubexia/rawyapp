'use client';

import React, { useState } from 'react';
import { useUsers, User } from '../../../hooks/useUsers';
import { UserTable } from '../../../components/features/users/UserTable';
import { UserFilters } from '../../../components/features/users/UserFilters';
import { UserModal } from '../../../components/features/users/UserModal';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error, activateUser, deactivateUser, deleteUser, promoteUser, updateUser } = useUsers(page, 20, role || undefined);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = async (id: string, updateData: Partial<User>) => {
    await updateUser({ userId: id, data: updateData });
  };

  const handlePromoteUser = async (id: string, newRole: string) => {
    await promoteUser({ userId: id, role: newRole });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users</h1>
      </div>

      <UserFilters role={role} setRole={setRole} search={search} setSearch={setSearch} />

      {error && <div className="text-red-500">Failed to load users</div>}
      
      {isLoading ? (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <UserTable 
            users={data?.data || []} 
            onEdit={handleEdit}
            onActivate={activateUser}
            onDeactivate={deactivateUser}
            onDelete={deleteUser}
          />
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing page {data?.page} of {data?.totalPages || 1} ({data?.total || 0} total users)
            </span>
            <div className="flex space-x-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={!data || page >= data.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <UserModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        user={selectedUser} 
        onSave={handleSaveUser}
        onPromote={handlePromoteUser}
      />
    </div>
  );
}
