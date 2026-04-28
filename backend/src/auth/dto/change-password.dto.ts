import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password for verification (optional if OTP provided)',
    example: 'CurrentPass123!',
  })
  @IsOptional()
  @IsString({ message: 'Current password must be a string' })
  currentPassword?: string;

  @ApiProperty({
    description: 'New password (min 8 characters)',
    example: 'NewSecurePass456!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  newPassword: string;

  @ApiProperty({
    description: '6-digit OTP for password change verification',
    example: '123456',
  })
  @IsOptional()
  @IsString({ message: 'OTP must be a string' })
  otp?: string;
}
