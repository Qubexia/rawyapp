import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { User } from '../../../hooks/useUsers';
import Link from 'next/link';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDeactivate: (userId: string) => void;
  onActivate: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export function UserTable({ users, onEdit, onDeactivate, onActivate, onDelete }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell className="font-medium max-w-[150px] truncate" title={user.name}>
              <Link href={`/users/${user._id}`} className="text-blue-600 hover:underline">
                {user.name}
              </Link>
            </TableCell>
            <TableCell className="max-w-[200px] truncate" title={user.email}>{user.email}</TableCell>
            <TableCell>
              <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'CREATOR' ? 'info' : 'default'}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.isActive ? 'success' : 'warning'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{dateFormatter.format(new Date(user.createdAt))}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>Edit</Button>
              {user.isActive ? (
                <Button variant="ghost" size="sm" className="text-orange-600" onClick={() => onDeactivate(user._id)}>Deactivate</Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-green-600" onClick={() => onActivate(user._id)}>Activate</Button>
              )}
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(user._id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
