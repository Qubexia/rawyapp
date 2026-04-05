import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminService } from './admin.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { PromoteUserDto } from './dto/promote-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';
import { UpdatePodcastDto } from '../podcasts/dto/update-podcast.dto';
import { CreateEpisodeDto } from '../episodes/dto/create-episode.dto';
import { UpdateEpisodeDto } from '../episodes/dto/update-episode.dto';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';
import {
  generateFileName,
  audioFileFilter,
  imageFileFilter,
  getRelativeUrl,
} from '../common/utils/file-upload.util';

@ApiTags('admin')
@ApiBearerAuth()
@ApiCommonErrorResponses()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users (paginated, filter by role/status)' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listUsers(@Query() query: AdminQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:userId/deactivate')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivateUser(@Param('userId') userId: string) {
    return this.adminService.deactivateUser(userId);
  }

  @Patch('users/:userId/activate')
  @ApiOperation({ summary: 'Activate a user' })
  @ApiResponse({ status: 200, description: 'User activated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  activateUser(@Param('userId') userId: string) {
    return this.adminService.activateUser(userId);
  }

  @Patch('users/:userId/promote')
  @ApiOperation({ summary: 'Promote user to CREATOR or ADMIN' })
  @ApiResponse({ status: 200, description: 'User promoted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  promoteUser(@Param('userId') userId: string, @Body() dto: PromoteUserDto) {
    return this.adminService.promoteUser(userId, dto.role);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'User data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Patch('users/:userId')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(userId, dto);
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete user and cascade' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('creators')
  @ApiOperation({ summary: 'List creators (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of creators' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listCreators(@Query() query: AdminQueryDto) {
    return this.adminService.listCreators(query);
  }

  @Get('creators/:creatorId')
  @ApiOperation({ summary: 'Get creator details' })
  @ApiResponse({ status: 200, description: 'Creator data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Creator not found' })
  getCreator(@Param('creatorId') creatorId: string) {
    return this.adminService.getCreatorById(creatorId);
  }

  @Patch('creators/:creatorId')
  @ApiOperation({ summary: 'Update a creator' })
  @ApiResponse({ status: 200, description: 'Creator updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Creator not found' })
  updateCreator(
    @Param('creatorId') creatorId: string,
    @Body() dto: UpdateCreatorDto,
  ) {
    return this.adminService.updateCreator(creatorId, dto);
  }

  @Delete('creators/:creatorId')
  @ApiOperation({ summary: 'Remove creator status' })
  @ApiResponse({ status: 200, description: 'Creator status removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Creator not found' })
  removeCreatorStatus(@Param('creatorId') creatorId: string) {
    return this.adminService.removeCreatorStatus(creatorId);
  }

  @Get('podcasts')
  @ApiOperation({ summary: 'List podcasts (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of podcasts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listPodcasts(@Query() query: AdminQueryDto) {
    return this.adminService.listPodcasts(query);
  }

  @Get('podcasts/:podcastId')
  @ApiOperation({ summary: 'Get podcast details' })
  @ApiResponse({ status: 200, description: 'Podcast data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  getPodcast(@Param('podcastId') podcastId: string) {
    return this.adminService.getPodcastById(podcastId);
  }

  @Patch('podcasts/:podcastId')
  @ApiOperation({ summary: 'Update a podcast (supports cover image upload)' })
  @ApiResponse({ status: 200, description: 'Podcast updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Podcast Title' },
        description: { type: 'string', example: 'Updated description' },
        category: { type: 'string', example: 'Technology' },
        status: { type: 'string', example: 'published' },
        imageFile: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }], {
      storage: diskStorage({
        destination: './uploads/images',
        filename: generateFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  async updatePodcast(
    @Param('podcastId') podcastId: string,
    @Body() dto: UpdatePodcastDto,
    @UploadedFiles() files: { imageFile?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageFile?.[0];
    const coverImageUrl = imageFile
      ? getRelativeUrl(imageFile.path)
      : undefined;

    const podcast = await this.adminService.updatePodcast(
      podcastId,
      dto,
      coverImageUrl,
    );

    return {
      statusCode: 200,
      data: podcast,
    };
  }

  @Delete('podcasts/:podcastId')
  @ApiOperation({ summary: 'Remove a podcast (cascade)' })
  @ApiResponse({ status: 200, description: 'Podcast removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  removePodcast(@Param('podcastId') podcastId: string) {
    return this.adminService.removePodcast(podcastId);
  }

  @Get('episodes')
  @ApiOperation({ summary: 'List episodes (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of episodes' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listEpisodes(@Query() query: AdminQueryDto) {
    return this.adminService.listEpisodes(query);
  }

  @Post('episodes')
  @ApiOperation({ summary: 'Create an episode for any podcast (admin)' })
  @ApiResponse({ status: 201, description: 'Episode created' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing audio file or invalid data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Introduction to AI' },
        description: {
          type: 'string',
          example:
            'In this episode, we explore the basics of artificial intelligence',
        },
        podcastId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        duration: { type: 'number', example: 1800 },
        audioFile: { type: 'string', format: 'binary' },
        imageFile: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audioFile', maxCount: 1 },
        { name: 'imageFile', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'audioFile') {
              cb(null, './uploads/audio');
            } else {
              cb(null, './uploads/images');
            }
          },
          filename: generateFileName,
        }),
        fileFilter: (req, file, cb) => {
          if (file.fieldname === 'audioFile') {
            audioFileFilter(req, file, cb);
          } else {
            imageFileFilter(req, file, cb);
          }
        },
        limits: { fileSize: 500 * 1024 * 1024 },
      },
    ),
  )
  async createEpisode(
    @Body() createEpisodeDto: CreateEpisodeDto,
    @UploadedFiles()
    files: {
      audioFile?: Express.Multer.File[];
      imageFile?: Express.Multer.File[];
    },
  ) {
    const audioFile = files?.audioFile?.[0];
    const imageFile = files?.imageFile?.[0];

    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    const audioFileUrl = getRelativeUrl(audioFile.path);
    const imageUrl = imageFile ? getRelativeUrl(imageFile.path) : undefined;

    const episode = await this.adminService.createEpisode(
      createEpisodeDto,
      audioFileUrl,
      imageUrl,
    );

    return {
      statusCode: 201,
      data: episode,
    };
  }

  @Get('episodes/:episodeId')
  @ApiOperation({ summary: 'Get episode details' })
  @ApiResponse({ status: 200, description: 'Episode data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  getEpisode(@Param('episodeId') episodeId: string) {
    return this.adminService.getEpisodeById(episodeId);
  }

  @Patch('episodes/:episodeId')
  @ApiOperation({ summary: 'Update episode metadata (no audio replacement)' })
  @ApiResponse({ status: 200, description: 'Episode updated' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - audio file change not allowed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Episode Title' },
        description: {
          type: 'string',
          example: 'Updated episode description text',
        },
        imageFile: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }], {
      storage: diskStorage({
        destination: './uploads/images',
        filename: generateFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  async updateEpisode(
    @Param('episodeId') episodeId: string,
    @Body() dto: UpdateEpisodeDto,
    @UploadedFiles() files: { imageFile?: Express.Multer.File[] },
  ) {
    const imageFile = files?.imageFile?.[0];
    const imageUrl = imageFile ? getRelativeUrl(imageFile.path) : undefined;

    const episode = await this.adminService.updateEpisode(
      episodeId,
      dto,
      imageUrl,
    );

    return {
      statusCode: 200,
      data: episode,
    };
  }

  @Delete('episodes/:episodeId')
  @ApiOperation({ summary: 'Remove an episode (cascade)' })
  @ApiResponse({ status: 200, description: 'Episode removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  removeEpisode(@Param('episodeId') episodeId: string) {
    return this.adminService.removeEpisode(episodeId);
  }

  @Get('comments')
  @ApiOperation({ summary: 'List comments (paginated)' })
  @ApiResponse({ status: 200, description: 'Paginated list of comments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listComments(@Query() query: AdminQueryDto) {
    return this.adminService.listComments(query);
  }

  @Get('comments/:commentId')
  @ApiOperation({ summary: 'Get comment details' })
  @ApiResponse({ status: 200, description: 'Comment data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  getComment(@Param('commentId') commentId: string) {
    return this.adminService.getCommentById(commentId);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Remove a comment' })
  @ApiResponse({ status: 200, description: 'Comment removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  removeComment(@Param('commentId') commentId: string) {
    return this.adminService.removeComment(commentId);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get platform stats (users, creators, podcasts, episodes)',
  })
  @ApiResponse({ status: 200, description: 'Stats object' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics overview' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAnalyticsOverview() {
    return this.adminService.getAnalyticsOverview();
  }

  @Get('analytics/top-episodes')
  @ApiOperation({ summary: 'Get top episodes by views/likes' })
  @ApiResponse({ status: 200, description: 'Top episodes list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getTopEpisodes(@Query() query: AdminQueryDto) {
    return this.adminService.getTopEpisodes(query);
  }

  @Get('analytics/top-creators')
  @ApiOperation({ summary: 'Get top creators by followers' })
  @ApiResponse({ status: 200, description: 'Top creators list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getTopCreators(@Query() query: AdminQueryDto) {
    return this.adminService.getTopCreators(query);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List broadcast notification history' })
  @ApiResponse({ status: 200, description: 'Notification history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listNotifications(@Query() query: AdminQueryDto) {
    return this.adminService.listBroadcastNotifications(query);
  }

  @Post('notifications/broadcast')
  @ApiOperation({ summary: 'Send broadcast notification to all users' })
  @ApiResponse({ status: 201, description: 'Broadcast sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  broadcastNotification(@Body() dto: BroadcastNotificationDto) {
    return this.adminService.broadcastNotification(dto, undefined);
  }

  @Post('notifications/broadcast-by-role')
  @ApiOperation({ summary: 'Send broadcast notification to specific role' })
  @ApiResponse({ status: 201, description: 'Broadcast sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  broadcastNotificationByRole(@Body() dto: BroadcastNotificationDto) {
    return this.adminService.broadcastNotification(dto, dto.targetRole);
  }

  @Get('system/health')
  @ApiOperation({ summary: 'Get backend health status' })
  @ApiResponse({ status: 200, description: 'Health status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('system/config')
  @ApiOperation({ summary: 'Get non-sensitive system configuration' })
  @ApiResponse({ status: 200, description: 'System config' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getSystemConfig() {
    return this.adminService.getSystemConfig();
  }
}
