import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Button } from '../../ui/Button';
import { Episode } from '../../../hooks/useEpisodes';

interface EpisodeTableProps {
  episodes: Episode[];
  onDelete: (episodeId: string) => void;
}

export function EpisodeTable({ episodes, onDelete }: EpisodeTableProps) {
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
            <TableCell className="font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">{episode.title}</TableCell>
            <TableCell className="text-gray-500 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{episode.podcast?.title || 'Unknown'}</TableCell>
            <TableCell className="text-gray-500 text-sm">{episode.creator?.name || 'Unknown'}</TableCell>
            <TableCell className="text-xs text-gray-400 font-mono">
              <div>Views: {episode.viewsCount}</div>
              <div>Likes: {episode.likesCount}</div>
              <div>Comments: {episode.commentsCount}</div>
            </TableCell>
            <TableCell>{new Date(episode.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(episode._id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
