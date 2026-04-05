import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  id: string;

  @ApiProperty({ example: '60d0fe4f5311236168a109cb' })
  recipientId: string;

  @ApiProperty({ example: 'new_episode' })
  type: string;

  @ApiProperty({
    example: {
      id: '60d0fe4f5311236168a109cc',
      name: 'John Doe',
      avatarUrl: '/uploads/avatars/john.jpg',
    },
  })
  lastActor: {
    id: string;
    name: string;
    avatarUrl?: string;
  };

  @ApiProperty({ example: 3 })
  actorCount: number;

  @ApiProperty({ example: '60d0fe4f5311236168a109cd' })
  targetId: string;

  @ApiProperty({ example: 'Episode' })
  targetModel: string;

  @ApiProperty({ example: '60d0fe4f5311236168a109ce', required: false })
  episodeId?: string;

  @ApiProperty({ example: 'Check out the new episode...', required: false })
  previewText?: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class UnreadCountDto {
  @ApiProperty({ example: 5 })
  unreadCount: number;
}
