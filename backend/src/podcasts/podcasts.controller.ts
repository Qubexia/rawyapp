import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
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
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { PodcastsService } from './podcasts.service';
import { UsersService } from '../users/users.service';
import { SyncService } from '../sync/services/sync.service';
import { AppleApiService } from './services/apple-api.service';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { UpdatePodcastDto } from './dto/update-podcast.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/constants/roles.enum';
import {
  getImageMulterConfig,
  getRelativeUrl,
} from '../common/utils/file-upload.util';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

@ApiTags('Podcasts')
@ApiCommonErrorResponses()
@Controller('podcasts')
export class PodcastsController {
  constructor(
    private readonly podcastsService: PodcastsService,
    private readonly appleApiService: AppleApiService,
    private readonly usersService: UsersService,
    private readonly syncService: SyncService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new podcast' })
  @ApiResponse({ status: 201, description: 'Podcast created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Creator role required',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Tech Talk Daily' },
        description: {
          type: 'string',
          example: 'A daily podcast about technology trends',
        },
        coverImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('coverImage', getImageMulterConfig(5 * 1024 * 1024)),
  )
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() createPodcastDto: CreatePodcastDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    let coverImageUrl: string | undefined;

    if (coverImage) {
      coverImageUrl = getRelativeUrl(coverImage.path);
    }

    const podcast = await this.podcastsService.create(
      new Types.ObjectId(userId),
      createPodcastDto,
      coverImageUrl,
    );

    return {
      statusCode: 201,
      data: podcast,
    };
  }

  @Get('discover')
  @Public()
  @ApiOperation({ summary: 'Discover top podcasts safely from Apple API' })
  @ApiResponse({ status: 200, description: 'Podcasts fetched successfully' })
  async discover() {
    const podcasts = await this.appleApiService.fetchTopPodcasts();
    return {
      statusCode: 200,
      data: podcasts,
    };
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search external podcasts by keyword' })
  @ApiResponse({ status: 200, description: 'Podcasts fetched successfully' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    const podcasts = await this.appleApiService.searchPodcasts(query);
    return {
      statusCode: 200,
      data: podcasts,
    };
  }

  @Get('creator')
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all podcasts owned by the current creator' })
  @ApiResponse({ status: 200, description: 'Podcasts retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getCreatorPodcasts(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.podcastsService.findAll(page, limit, userId);
    return {
      statusCode: 200,
      data: result,
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all podcasts (public)' })
  @ApiResponse({ status: 200, description: 'Podcasts retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'creatorId',
    required: false,
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Keyword search across title and description',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
    enum: [
      'Technology',
      'Business',
      'Comedy',
      'Education',
      'Health',
      'Science',
      'Culture',
      'Sports',
    ],
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('creatorId') creatorId?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }

    const result = await this.podcastsService.findAll(
      page,
      limit,
      creatorId,
      search,
      category,
    );

    return {
      statusCode: 200,
      data: result,
    };
  }

  @Get('resolve/:appleId')
  @Public()
  @ApiOperation({
    summary: 'Resolve an external Apple podcast ID (imports if needed)',
  })
  @ApiResponse({ status: 200, description: 'Podcast resolved successfully' })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  async resolveExternal(@Param('appleId') appleId: string) {
    const podcast = await this.podcastsService.findOrImportApplePodcast(appleId);
    return {
      statusCode: 200,
      data: podcast,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a podcast by ID (public)' })
  @ApiResponse({ status: 200, description: 'Podcast retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  async findById(@Param('id') id: string) {
    const podcast: unknown = await this.podcastsService.findById(id);

    return {
      statusCode: 200,
      data: podcast,
    };
  }

  @Post(':id/subscribe')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to a podcast' })
  @ApiResponse({ status: 200, description: 'Subscribed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  async subscribe(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.usersService.subscribeToPodcast(userId, id);
    return {
      statusCode: 200,
      message: 'Subscribed successfully',
    };
  }

  @Delete(':id/subscribe')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from a podcast' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unsubscribe(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.usersService.unsubscribeFromPodcast(userId, id);
    return {
      statusCode: 200,
      message: 'Unsubscribed successfully',
    };
  }

  @Patch(':id')
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a podcast (owner only)' })
  @ApiResponse({ status: 200, description: 'Podcast updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Tech Talk Daily' },
        description: {
          type: 'string',
          example: 'A daily podcast about technology trends',
        },
        coverImage: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('coverImage', getImageMulterConfig(5 * 1024 * 1024)),
  )
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() updatePodcastDto: UpdatePodcastDto,
    @UploadedFile() coverImage?: Express.Multer.File,
  ) {
    // Ensure the requester actually owns this podcast (unless ADMIN)
    if (userRole !== 'ADMIN') {
      const isOwner = await this.podcastsService.isOwner(
        id,
        new Types.ObjectId(userId),
      );
      if (!isOwner) {
        throw new BadRequestException(
          'You do not have permission to update this podcast',
        );
      }
    }
    let coverImageUrl: string | undefined;

    if (coverImage) {
      coverImageUrl = getRelativeUrl(coverImage.path);
    }

    const podcast = await this.podcastsService.update(
      id,
      updatePodcastDto,
      new Types.ObjectId(userId),
      userRole,
      coverImageUrl,
    );

    return {
      statusCode: 200,
      data: podcast,
    };
  }

  @Patch(':id/sync')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger a manual sync for an external podcast' })
  @ApiResponse({
    status: 200,
    description: 'Podcast sync triggered successfully',
  })
  @ApiResponse({ status: 400, description: 'Cannot sync internal podcasts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async syncPodcast(@Param('id') id: string) {
    try {
      await this.syncService.syncPodcastById(id);
      return {
        statusCode: 200,
        message: 'Sync completed successfully',
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to sync podcast');
    }
  }

  @Delete(':id')
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a podcast (owner or admin)' })
  @ApiResponse({ status: 200, description: 'Podcast deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner or admin',
  })
  @ApiResponse({ status: 404, description: 'Podcast not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    // Ensure the requester actually owns this podcast (unless ADMIN)
    if (userRole !== 'ADMIN') {
      const isOwner = await this.podcastsService.isOwner(
        id,
        new Types.ObjectId(userId),
      );
      if (!isOwner) {
        throw new BadRequestException(
          'You do not have permission to delete this podcast',
        );
      }
    }

    await this.podcastsService.delete(id, new Types.ObjectId(userId), userRole);

    return {
      statusCode: 200,
      message: 'Podcast deleted successfully',
    };
  }
}
