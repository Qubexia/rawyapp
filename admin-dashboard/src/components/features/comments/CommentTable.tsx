import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Button } from '../../ui/Button';
import { Comment } from '../../../hooks/useComments';

interface CommentTableProps {
  comments: Comment[];
  onDelete: (commentId: string) => void;
}

export function CommentTable({ comments, onDelete }: CommentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Author</TableHead>
          <TableHead>Episode</TableHead>
          <TableHead>Comment Preview</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comments.map((comment) => (
          <TableRow key={comment._id}>
            <TableCell className="font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
              {comment.user?.name || 'Unknown User'}
            </TableCell>
            <TableCell className="text-gray-500 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
              {comment.episode?.title || 'Unknown Episode'}
            </TableCell>
            <TableCell className="text-gray-600 text-sm italic max-w-xs break-words">
              {comment.text.length > 80 ? `${comment.text.substring(0, 80)}...` : comment.text}
            </TableCell>
            <TableCell className="text-sm">{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(comment._id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
