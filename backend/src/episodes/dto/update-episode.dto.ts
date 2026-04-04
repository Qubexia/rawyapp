import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class UpdateEpisodeDto {
  @ApiProperty({
    description: 'Episode title',
    example: 'Introduction to AI',
    minLength: 3,
    maxLength: 200,
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @ApiProperty({
    description: 'Episode description',
    example: 'In this episode, we explore the basics of artificial intelligence',
    minLength: 10,
    maxLength: 5000,
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @ApiProperty({
    description: 'Episode cover image URL (relative path)',
    example: 'uploads/images/uuid-cover.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
