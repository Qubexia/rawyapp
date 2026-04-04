import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Podcast } from '../../../hooks/usePodcasts';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

interface PodcastTableProps {
  podcasts: Podcast[];
  onEdit: (podcast: Podcast) => void;
  onDelete: (podcastId: string) => void;
}

export function PodcastTable({ podcasts, onEdit, onDelete }: PodcastTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Episodes</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {podcasts.map((podcast) => (
          <TableRow key={podcast._id}>
            <TableCell className="font-medium max-w-[200px] truncate" title={podcast.title}>{podcast.title}</TableCell>
            <TableCell className="max-w-[150px] truncate" title={podcast.creator?.name || 'Unknown'}>{podcast.creator?.name || 'Unknown'}</TableCell>
            <TableCell>
              <Badge variant="default">{podcast.category}</Badge>
            </TableCell>
            <TableCell>{podcast.episodeCount}</TableCell>
            <TableCell>{dateFormatter.format(new Date(podcast.createdAt))}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(podcast)}>Edit</Button>
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(podcast._id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
