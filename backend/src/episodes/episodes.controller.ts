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
  UploadedFiles,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/constants/roles.enum';
import {
  generateFileName,
  audioFileFilter,
  imageFileFilter,
  getRelativeUrl,
} from '../common/utils/file-upload.util';
import { Types } from 'mongoose';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

@ApiTags('Episodes')
@ApiCommonErrorResponses()
@Controller('episodes')
export class EpisodesController {
  constructor(
    private readonly episodesService: EpisodesService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new episode' })
  @ApiResponse({ status: 201, description: 'Episode created successfully' })
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
        limits: { fileSize: 100 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() createEpisodeDto: CreateEpisodeDto,
    @UploadedFiles() files: { audioFile?: Express.Multer.File[]; imageFile?: Express.Multer.File[] },
  ) {
    const audioFile = files?.audioFile?.[0];
    const imageFile = files?.imageFile?.[0];

    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    const audioFileUrl = getRelativeUrl(audioFile.path);
    const imageFileUrl = imageFile ? getRelativeUrl(imageFile.path) : undefined;

    const episode = await this.episodesService.create(
      new Types.ObjectId(userId),
      createEpisodeDto,
      audioFileUrl,
      imageFileUrl,
    );

    return {
      statusCode: 201,
      data: episode,
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all episodes (public)' })
  @ApiResponse({ status: 200, description: 'Episodes retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'podcastId',
    required: false,
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'creatorId',
    required: false,
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('podcastId') podcastId?: string,
    @Query('creatorId') creatorId?: string,
  ) {
    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }

    const result = await this.episodesService.findAll(
      page,
      limit,
      podcastId,
      creatorId,
    );

    return {
      statusCode: 200,
      data: result,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get an episode by ID (public)' })
  @ApiResponse({ status: 200, description: 'Episode retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async findById(@Param('id') id: string) {
    const episode: unknown = await this.episodesService.findById(id);

    return {
      statusCode: 200,
      data: episode,
    };
  }

  @Patch(':id')
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an episode (owner only)' })
  @ApiResponse({ status: 200, description: 'Episode updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
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
      },
    },
  })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
    @Body() updateEpisodeDto: UpdateEpisodeDto,
  ) {
    // Ensure the requester actually owns this episode (unless ADMIN)
    if (userRole !== 'ADMIN') {
      const isOwner = await this.episodesService.isOwner(id, new Types.ObjectId(userId));
      if (!isOwner) {
        throw new BadRequestException('You do not have permission to update this episode');
      }
    }
    const episode = await this.episodesService.update(
      id,
      updateEpisodeDto,
      new Types.ObjectId(userId),
      userRole,
    );

    return {
      statusCode: 200,
      data: episode,
    };
  }

  @Delete(':id')
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an episode (owner or admin)' })
  @ApiResponse({ status: 200, description: 'Episode deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not the owner or admin',
  })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    // Ensure the requester actually owns this episode (unless ADMIN)
    if (userRole !== 'ADMIN') {
      const isOwner = await this.episodesService.isOwner(id, new Types.ObjectId(userId));
      if (!isOwner) {
        throw new BadRequestException('You do not have permission to delete this episode');
      }
    }

    await this.episodesService.delete(id, new Types.ObjectId(userId), userRole);

    return {
      statusCode: 200,
      message: 'Episode deleted successfully',
    };
  }
}
