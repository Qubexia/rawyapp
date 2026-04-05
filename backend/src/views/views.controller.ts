import { Controller, Post, Param, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ViewsService } from './views.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

@ApiTags('Views')
@ApiCommonErrorResponses()
@Controller('views')
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Post('episodes/:episodeId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record episode view (idempotent)' })
  @ApiParam({ name: 'episodeId', description: 'Episode ID' })
  @ApiResponse({
    status: 201,
    description: 'View recorded (first time)',
    schema: {
      properties: {
        message: { type: 'string' },
        viewsCount: { type: 'number' },
        isNewView: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'View already recorded',
    schema: {
      properties: {
        message: { type: 'string' },
        viewsCount: { type: 'number' },
        isNewView: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async recordView(
    @CurrentUser('id') userId: string,
    @Param('episodeId') episodeId: string,
  ) {
    if (!Types.ObjectId.isValid(episodeId)) {
      throw new BadRequestException('Invalid episode ID');
    }
    const result = await this.viewsService.recordView(
      new Types.ObjectId(userId),
      new Types.ObjectId(episodeId),
    );
    const statusCode = result.isNewView ? 201 : 200;
    return {
      statusCode,
      data: {
        message: result.isNewView ? 'View recorded' : 'View already recorded',
        viewsCount: result.viewsCount,
        isNewView: result.isNewView,
      },
    };
  }
}
