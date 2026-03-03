import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment text',
    minLength: 1,
    maxLength: 1000,
    example: 'Great episode!',
  })
  @IsString()
  @MinLength(1, { message: 'Comment text must be at least 1 character' })
  @MaxLength(1000, { message: 'Comment text must not exceed 1000 characters' })
  text: string;
}
