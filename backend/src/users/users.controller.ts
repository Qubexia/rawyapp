import { Controller, Get, Patch, Post, Delete, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserDocument } from './schemas/user.schema';
import { DeviceTokenDto } from './dto/device-token.dto';

@ApiTags('users')
@ApiCommonErrorResponses()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: UserDocument) {
    return this.usersService.findById(user._id.toString());
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile updated successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  async updateCurrentUser(
    @CurrentUser() user: UserDocument,
    @Body() updateData: Partial<{ name: string }>,
  ) {
    return this.usersService.update(user._id.toString(), updateData);
  }

  @Post('me/device-token')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Register FCM device token for push notifications' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Device token registered' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  async addDeviceToken(@CurrentUser() user: UserDocument, @Body() dto: DeviceTokenDto) {
    await this.usersService.addDeviceToken(user._id.toString(), dto.token);
  }

  @Delete('me/device-token')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove FCM device token' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Device token removed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  async removeDeviceToken(@CurrentUser() user: UserDocument, @Body() dto: DeviceTokenDto) {
    await this.usersService.removeDeviceToken(user._id.toString(), dto.token);
  }
}
