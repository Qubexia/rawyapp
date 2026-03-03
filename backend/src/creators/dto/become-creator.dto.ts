import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for becoming a creator
 * Empty body - just triggers role elevation to CREATOR
 */
export class BecomeCreatorDto {
  @ApiProperty({
    required: false,
    description: 'Empty body - just triggers role elevation to CREATOR',
    example: {},
  })
  // Empty DTO - no fields required
  // Just triggers the user's role to be elevated to CREATOR
  dummy?: string;
}
