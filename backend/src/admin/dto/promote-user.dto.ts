import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/constants/roles.enum';

export class PromoteUserDto {
  @ApiProperty({
    description: 'New role (CREATOR or ADMIN only)',
    enum: [Role.CREATOR, Role.ADMIN],
  })
  @IsIn([Role.CREATOR, Role.ADMIN], {
    message: 'role must be one of: CREATOR, ADMIN',
  })
  role: Role.CREATOR | Role.ADMIN;
}
