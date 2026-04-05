import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PushPreferenceDto {
  @ApiProperty({ description: 'Whether push notifications are enabled' })
  @IsBoolean()
  enabled: boolean;
}
