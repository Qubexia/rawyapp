import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SuggestionsService } from './suggestions.service';
import { Types } from 'mongoose';

@ApiTags('suggestions')
@Controller('suggestions')
export class SuggestionsController {
    constructor(private readonly suggestionsService: SuggestionsService) { }

    @ApiOperation({ summary: 'Get suggested users to follow based on location/popularity' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @Get()
    async getSuggestions(
        @Request() req,
        @Query('limit') limit: number = 10,
    ) {
        const limitNum = Number(limit) || 10;
        const userId = new Types.ObjectId(req.user.userId || req.user.id);
        return this.suggestionsService.getSuggestedUsers(userId, limitNum);
    }
}
