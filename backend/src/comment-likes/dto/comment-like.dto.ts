import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentLikeDto {
  // Can be left empty or extended based on requirements since userId comes from auth and commentId from path
}

export class CommentLikeStatusDto {
  @ApiProperty({
    description: 'Whether the current user has liked the comment',
  })
  isLiked: boolean;

  @ApiProperty({ description: 'Total number of likes on the comment' })
  likesCount: number;
}
