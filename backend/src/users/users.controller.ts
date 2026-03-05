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
import { getImageMulterConfig } from '../common/utils/file-upload.util';

@ApiTags('users')
@ApiCommonErrorResponses()
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private followsService: FollowsService,
  ) {}

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
    return this.usersService.updateAvatar(user._id.toString(), file.path);
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
