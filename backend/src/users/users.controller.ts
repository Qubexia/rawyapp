import { Controller, Get, Patch, Post, Delete, Body, UseInterceptors, UploadedFile, HttpCode, HttpStatus, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { Request } from 'express';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';
import { UsersService } from './users.service';
import { FollowsService } from '../follows/follows.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserDocument } from './schemas/user.schema';
import { PublicUserDto } from './dto/public-user.dto';
import { DeviceTokenDto } from './dto/device-token.dto';
import { PushPreferenceDto } from './dto/push-preference.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { getImageMulterConfig, normalizePath } from '../common/utils/file-upload.util';

@ApiTags('users')
@ApiCommonErrorResponses()
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private followsService: FollowsService,
  ) { }

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
    @Body() updateData: UpdateUserDto,
  ) {
    return this.usersService.update(user._id.toString(), updateData);
  }

  @Patch('me/avatar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Avatar updated successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('avatar', getImageMulterConfig(2 * 1024 * 1024)))
  async updateAvatar(
    @CurrentUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(user._id.toString(), normalizePath(file.path));
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

  @Patch('me/push-preference')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update push notification preference' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Push preference updated' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async updatePushPreference(
    @CurrentUser() user: UserDocument,
    @Body() dto: PushPreferenceDto,
  ) {
    await this.usersService.updatePushPreference(user._id.toString(), dto.enabled);
    return { enabled: dto.enabled };
  }

  @Patch('me/location')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user location' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Location updated successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async updateLocation(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.usersService.updateLocation(user._id.toString(), dto);
  }

  @Delete('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete account (requires password re-entry)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account deleted successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Password is incorrect' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async deleteAccount(
    @CurrentUser() user: UserDocument,
    @Body() dto: DeleteAccountDto,
  ): Promise<{ message: string }> {
    await this.usersService.deleteAccount(user._id.toString(), dto.password);
    return { message: 'Account deleted successfully' };
  }

  @Get(':id/public')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get public user profile' })
  @ApiResponse({ status: HttpStatus.OK, type: PublicUserDto })
  async getPublicProfile(
    @Param('id') id: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const profile = await this.usersService.getPublicProfile(id);

    // Check if current user follows this user
    if (req.user?.sub) {
      profile.isFollowing = await this.followsService.isFollowing(
        new Types.ObjectId(req.user.sub),
        new Types.ObjectId(id),
      );
    }

    return profile;
  }
}
