import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

@ApiTags('Follows')
@ApiCommonErrorResponses()
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('users/:targetId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  @ApiParam({ name: 'targetId', description: 'Target user ID' })
  @ApiResponse({ status: 201, description: 'Now following', schema: { properties: { message: { type: 'string' }, followerCount: { type: 'number' } } } })
  @ApiResponse({ status: 400, description: 'Self-follow not allowed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Already following this user' })
  async follow(
    @CurrentUser('id') userId: string,
    @Param('targetId') targetId: string,
  ) {
    if (!Types.ObjectId.isValid(targetId)) {
      throw new BadRequestException('Invalid target ID');
    }
    const result = await this.followsService.follow(
      new Types.ObjectId(userId),
      new Types.ObjectId(targetId),
    );
    return {
      statusCode: 201,
      data: { message: 'Now following', followerCount: result.followerCount },
    };
  }

  @Delete('users/:targetId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({ name: 'targetId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Unfollowed', schema: { properties: { message: { type: 'string' }, followerCount: { type: 'number' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not following this user' })
  async unfollow(
    @CurrentUser('id') userId: string,
    @Param('targetId') targetId: string,
  ) {
    if (!Types.ObjectId.isValid(targetId)) {
      throw new BadRequestException('Invalid target ID');
    }
    const result = await this.followsService.unfollow(
      new Types.ObjectId(userId),
      new Types.ObjectId(targetId),
    );
    return {
      statusCode: 200,
      data: { message: 'Unfollowed', followerCount: result.followerCount },
    };
  }

  @Get('users/:targetId/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user follows a user' })
  @ApiParam({ name: 'targetId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Status', schema: { properties: { isFollowing: { type: 'boolean' }, followerCount: { type: 'number' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getStatus(
    @CurrentUser('id') userId: string,
    @Param('targetId') targetId: string,
  ) {
    if (!Types.ObjectId.isValid(targetId)) {
      throw new BadRequestException('Invalid target ID');
    }
    const result = await this.followsService.getStatus(
      new Types.ObjectId(userId),
      new Types.ObjectId(targetId),
    );
    return { statusCode: 200, data: result };
  }

  @Get('me/following')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List users the current user follows (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated user profiles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFollowing(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }
    const result = await this.followsService.getFollowing(
      new Types.ObjectId(userId),
      page,
      limit,
    );
    return { statusCode: 200, data: result };
  }

  @Get('users/:targetId/followers')
  @Public()
  @ApiOperation({ summary: 'List followers of a user (public, paginated)' })
  @ApiParam({ name: 'targetId', description: 'Target user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated user summaries' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getFollowers(
    @Param('targetId') targetId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    if (!Types.ObjectId.isValid(targetId)) {
      throw new BadRequestException('Invalid target ID');
    }
    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }
    const result = await this.followsService.getFollowers(
      new Types.ObjectId(targetId),
      page,
      limit,
    );
    return { statusCode: 200, data: result };
  }
}
