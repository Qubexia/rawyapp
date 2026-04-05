import {
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SocialLinksDto {
  @IsOptional()
  @IsUrl()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Website URL',
    example: 'https://example.com',
  })
  website?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Twitter handle',
    example: '@creator',
  })
  twitter?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Instagram handle',
    example: '@creator',
  })
  instagram?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    description: 'YouTube channel handle',
    example: '@creator',
  })
  youtube?: string;
}

export class UpdateCreatorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    type: String,
    required: false,
    maxLength: 500,
    description: 'Creator biography',
    example: 'I create amazing content about technology and design.',
  })
  bio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  @ApiProperty({
    type: SocialLinksDto,
    required: false,
    description: 'Social media links',
    example: { website: 'https://example.com', twitter: '@creator' },
  })
  socialLinks?: SocialLinksDto;
}
