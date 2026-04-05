import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

@ApiTags('Comments')
@ApiCommonErrorResponses()
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('episodes/:episodeId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a comment on an episode' })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  @ApiResponse({ status: 201, description: 'Comment created' })
  @ApiResponse({
    status: 400,
    description: 'Invalid episode ID or validation error',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async create(
    @CurrentUser('id') userId: string,
    @Param('episodeId') episodeId: string,
    @Body() dto: CreateCommentDto,
  ) {
    if (!Types.ObjectId.isValid(episodeId)) {
      throw new BadRequestException('Invalid episode ID');
    }
    const comment = await this.commentsService.createComment(
      new Types.ObjectId(userId),
      new Types.ObjectId(episodeId),
      dto,
    );
    return { statusCode: 201, data: comment };
  }

  @Get('episodes/:episodeId')
  @Public()
  @ApiOperation({
    summary: 'Get comments for an episode (paginated, oldest first)',
  })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  @ApiResponse({ status: 200, description: 'Paginated comments' })
  @ApiResponse({ status: 400, description: 'Invalid episode ID' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async getByEpisode(
    @Param('episodeId') episodeId: string,
    @Query() query: PaginationQueryDto,
  ) {
    if (!Types.ObjectId.isValid(episodeId)) {
      throw new BadRequestException('Invalid episode ID');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const result = await this.commentsService.getCommentsByEpisode(
      new Types.ObjectId(episodeId),
      page,
      limit,
    );
    return { statusCode: 200, data: result };
  }

  @Get(':commentId/replies')
  @Public()
  @ApiOperation({
    summary: 'Get replies for a comment (paginated, oldest first)',
  })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Paginated replies' })
  @ApiResponse({ status: 400, description: 'Invalid comment ID' })
  async getReplies(
    @Param('commentId') commentId: string,
    @Query() query: PaginationQueryDto,
  ) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid comment ID');
    }
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const result = await this.commentsService.getReplies(
      new Types.ObjectId(commentId),
      page,
      limit,
    );
    return { statusCode: 200, data: result };
  }

  @Delete(':commentId')
  @ApiBearerAuth()
  @Roles(Role.USER, Role.CREATOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a comment (author or admin)' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted' })
  @ApiResponse({ status: 400, description: 'Invalid comment ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async delete(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Param('commentId') commentId: string,
  ) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid comment ID');
    }
    await this.commentsService.deleteComment(
      new Types.ObjectId(commentId),
      new Types.ObjectId(userId),
      userRole,
    );
    return { statusCode: 200, data: { message: 'Comment deleted' } };
  }
}
