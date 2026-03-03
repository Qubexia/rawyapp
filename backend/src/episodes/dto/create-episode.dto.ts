import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  MinLength,
  MaxLength,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateEpisodeDto {
  @ApiProperty({
    description: 'Episode title',
    example: 'Introduction to AI',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiProperty({
    description: 'Episode description',
    example: 'In this episode, we explore the basics of artificial intelligence',
    minLength: 10,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description: string;

  @ApiProperty({
    description: 'Podcast ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'Invalid podcast ID format' })
  podcastId: string;

  @ApiProperty({
    description: 'Episode duration in seconds',
    example: 1800,
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Duration must be a positive number' })
  duration?: number;
}
