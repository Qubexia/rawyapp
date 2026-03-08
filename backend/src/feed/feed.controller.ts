import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { FeedService } from './feed.service';
import { Types } from 'mongoose';
import { FeedResponseDto } from './dto/feed-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('feed')
@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Get()
    @ApiOperation({ summary: 'Get personalized feed (followed creators + recommended)' })
    @ApiBearerAuth()
    @UseGuards(OptionalJwtAuthGuard)
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, type: FeedResponseDto })
    async getFeed(
        @CurrentUser('id') userId: string | undefined,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;

        let result;
        if (userId) {
            result = await this.feedService.getPersonalizedFeed(
                new Types.ObjectId(userId),
                pageNum,
                limitNum,
            );
        } else {
            result = await this.feedService.getTrendingFeed(pageNum, limitNum);
        }

        return { statusCode: 200, data: result };
    }
}
