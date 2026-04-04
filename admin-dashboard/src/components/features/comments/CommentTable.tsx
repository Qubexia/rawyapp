import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Button } from '../../ui/Button';
import { Comment } from '../../../hooks/useComments';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

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
            <TableCell className="font-medium max-w-[150px] truncate" title={comment.user?.name || 'Unknown User'}>
              {comment.user?.name || 'Unknown User'}
            </TableCell>
            <TableCell className="text-gray-500 text-sm max-w-[150px] truncate" title={comment.episode?.title || 'Unknown Episode'}>
              {comment.episode?.title || 'Unknown Episode'}
            </TableCell>
            <TableCell className="text-gray-600 text-sm italic max-w-[300px] truncate" title={comment.text}>
              {comment.text}
            </TableCell>
            <TableCell className="text-sm">{dateFormatter.format(new Date(comment.createdAt))}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(comment._id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
