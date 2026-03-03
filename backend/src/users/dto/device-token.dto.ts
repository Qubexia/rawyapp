import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeviceTokenDto {
  @ApiProperty({ description: 'FCM device token for push notifications' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
