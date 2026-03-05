import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/constants/roles.enum';

export class PublicUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  followerCount: number;

  @ApiProperty()
  followingCount: number;

  @ApiProperty({ required: false })
  isFollowing?: boolean;
}
