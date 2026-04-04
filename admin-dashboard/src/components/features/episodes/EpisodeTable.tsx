import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Button } from '../../ui/Button';
import { Episode } from '../../../hooks/useEpisodes';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

interface EpisodeTableProps {
  episodes: Episode[];
  onEdit?: (episode: Episode) => void;
  onDelete: (episodeId: string) => void;
}

export function EpisodeTable({ episodes, onEdit, onDelete }: EpisodeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Podcast</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead>Metrics</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {episodes.map((episode) => (
          <TableRow key={episode._id}>
            <TableCell className="font-medium max-w-[200px] truncate" title={episode.title}>{episode.title}</TableCell>
            <TableCell className="text-gray-500 text-sm max-w-[150px] truncate" title={episode.podcast?.title || 'Unknown'}>{episode.podcast?.title || 'Unknown'}</TableCell>
            <TableCell className="text-gray-500 text-sm max-w-[150px] truncate" title={episode.creator?.name || 'Unknown'}>{episode.creator?.name || 'Unknown'}</TableCell>
            <TableCell className="text-xs text-gray-400">
              <div>Views: {episode.viewsCount}</div>
              <div>Likes: {episode.likesCount}</div>
              <div>Comments: {episode.commentsCount}</div>
            </TableCell>
            <TableCell>{dateFormatter.format(new Date(episode.createdAt))}</TableCell>
            <TableCell className="text-right space-x-2">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(episode)}>Edit</Button>
              )}
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(episode._id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
