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
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('creatorId') creatorId?: string,
  ) {
    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }

    const result = await this.podcastsService.findAll(page, limit, creatorId);

    return {
      statusCode: 200,
      data: result,
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
    await this.podcastsService.delete(id, new Types.ObjectId(userId), userRole);

    return {
      statusCode: 200,
      message: 'Podcast deleted successfully',
    };
  }
}
