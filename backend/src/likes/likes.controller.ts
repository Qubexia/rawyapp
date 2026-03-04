import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

@ApiTags('Likes')
@ApiCommonErrorResponses()
@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('episodes/:episodeId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like an episode' })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  @ApiResponse({ status: 201, description: 'Episode liked', schema: { properties: { message: { type: 'string' }, likesCount: { type: 'number' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  @ApiResponse({ status: 409, description: 'Already liked this episode' })
  async like(
    @CurrentUser('id') userId: string,
    @Param('episodeId') episodeId: string,
  ) {
    if (!Types.ObjectId.isValid(episodeId)) {
      throw new BadRequestException('Invalid episode ID');
    }
    const result = await this.likesService.likeEpisode(
      new Types.ObjectId(userId),
      new Types.ObjectId(episodeId),
    );
    return {
      statusCode: 201,
      data: { 
        message: 'Episode liked', 
        isLiked: true,
        likesCount: result.likesCount 
      },
    };
  }

  @Delete('episodes/:episodeId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike an episode' })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  @ApiResponse({ status: 200, description: 'Episode unliked', schema: { properties: { message: { type: 'string' }, likesCount: { type: 'number' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not liked this episode' })
  async unlike(
    @CurrentUser('id') userId: string,
    @Param('episodeId') episodeId: string,
  ) {
    if (!Types.ObjectId.isValid(episodeId)) {
      throw new BadRequestException('Invalid episode ID');
    }
    const result = await this.likesService.unlikeEpisode(
      new Types.ObjectId(userId),
      new Types.ObjectId(episodeId),
    );
    return {
      statusCode: 200,
      data: { 
        message: 'Episode unliked', 
        isLiked: false,
        likesCount: result.likesCount 
      },
    };
  }

  @Get('episodes/:episodeId/status')
  @Public()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current user liked an episode and get like count' })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  @ApiResponse({ status: 200, description: 'Status', schema: { properties: { isLiked: { type: 'boolean' }, likesCount: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: 'Status for anonymous' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async getStatus(
    @CurrentUser('id') userId: string | undefined,
    @Param('episodeId') episodeId: string,
  ) {
    if (!Types.ObjectId.isValid(episodeId)) {
      throw new BadRequestException('Invalid episode ID');
    }
    const result = await this.likesService.getLikeStatus(
      userId ? new Types.ObjectId(userId) : null,
      new Types.ObjectId(episodeId),
    );
    return { statusCode: 200, data: result };
  }
}
