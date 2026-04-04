import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Button } from '../../ui/Button';
import { Creator } from '../../../hooks/useCreators';
import Link from 'next/link';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

interface CreatorTableProps {
  creators: Creator[];
  onDelete: (creatorId: string) => void;
}

export function CreatorTable({ creators, onDelete }: CreatorTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Show Name</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Podcasts</TableHead>
          <TableHead>Followers</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creators.map((creator) => (
          <TableRow key={creator._id}>
            <TableCell className="font-medium max-w-[200px] truncate" title={creator.showName}>
              <Link href={`/creators/${creator._id}`} className="text-blue-600 hover:underline">
                {creator.showName}
              </Link>
            </TableCell>
            <TableCell className="text-gray-500 text-xs max-w-[150px] truncate" title={creator.userId}>{creator.userId}</TableCell>
            <TableCell>{creator.podcastCount}</TableCell>
            <TableCell>{creator.followerCount}</TableCell>
            <TableCell>{dateFormatter.format(new Date(creator.createdAt))}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(creator._id)}>Remove Status</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
