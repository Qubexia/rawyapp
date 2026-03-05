import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CreatorsService } from './creators.service';
import { BecomeCreatorDto } from './dto/become-creator.dto';
import { UpdateCreatorProfileDto } from './dto/update-creator-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/constants/roles.enum';
import { getImageMulterConfig, normalizePath } from '../common/utils/file-upload.util';
import { UsersService } from '../users/users.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

@ApiTags('Creators')
@ApiCommonErrorResponses()
@Controller('creators')
export class CreatorsController {
  constructor(
    private readonly creatorsService: CreatorsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('become')
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Become a creator (elevate user role to CREATOR)' })
  @ApiResponse({ status: 201, description: 'Creator profile created successfully' })
  @ApiResponse({ status: 400, description: 'User is already a creator' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User role required' })
  async becomeCreator(
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @Body() becomeCreatorDto: BecomeCreatorDto,
  ) {
    // Check if already a creator
    const isCreator = await this.creatorsService.isCreator(new Types.ObjectId(userId));
    if (isCreator) {
      throw new BadRequestException('You are already a creator');
    }

    // Update user role to CREATOR
    await this.usersService.updateRole(userId, Role.CREATOR);

    // Create creator profile
    const creatorProfile = await this.creatorsService.becomeCreator(
      new Types.ObjectId(userId),
      userName,
    );

    return {
      statusCode: 201,
      data: creatorProfile,
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all creators (public, paginated)' })
  @ApiResponse({ status: 200, description: 'Creators retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    if (limit > 100) {
      throw new BadRequestException('Limit cannot exceed 100');
    }

    const result = await this.creatorsService.listCreators(page, limit);

    return {
      statusCode: 200,
      data: result,
    };
  }

  @Get('me')
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user creator profile' })
  @ApiResponse({ status: 200, description: 'Creator profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Creator role required' })
  @ApiResponse({ status: 404, description: 'Creator profile not found' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    const profile = await this.creatorsService.getProfile(userId, true);

    return {
      statusCode: 200,
      data: profile,
    };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a creator profile by ID (public)' })
  @ApiResponse({ status: 200, description: 'Creator profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Creator profile not found' })
  async findById(@Param('id') id: string) {
    const profile = await this.creatorsService.getProfile(id, false);

    return {
      statusCode: 200,
      data: profile,
    };
  }

  @Patch('me')
  @Roles(Role.CREATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user creator profile (owner only)' })
  @ApiResponse({ status: 200, description: 'Creator profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Creator role required' })
  @ApiResponse({ status: 404, description: 'Creator profile not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bio: { type: 'string', example: 'I create amazing content about technology and design.' },
        socialLinks: {
          type: 'object',
          properties: {
            website: { type: 'string', example: 'https://example.com' },
            twitter: { type: 'string', example: '@creator' },
            instagram: { type: 'string', example: '@creator' },
            youtube: { type: 'string', example: '@creator' },
          },
        },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor(
      'avatar',
      getImageMulterConfig(5 * 1024 * 1024),
    ),
  )
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateCreatorProfileDto: UpdateCreatorProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    let avatarUrl: string | undefined;

    if (avatar) {
      avatarUrl = normalizePath(avatar.path);
    }

    const profile = await this.creatorsService.updateProfile(
      new Types.ObjectId(userId),
      updateCreatorProfileDto,
      avatarUrl,
    );

    return {
      statusCode: 200,
      data: profile,
    };
  }
}
