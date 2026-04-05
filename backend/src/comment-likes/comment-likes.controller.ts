import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommentLikesService } from './comment-likes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import type { Request } from 'express';
import { CommentLikeStatusDto } from './dto/comment-like.dto';

@ApiTags('comment-likes')
@Controller('comment-likes')
export class CommentLikesController {
  constructor(private readonly commentLikesService: CommentLikesService) {}

  @Post('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a comment' })
  @ApiResponse({ status: 201, description: 'Comment successfully liked.' })
  @ApiResponse({ status: 404, description: 'Comment not found.' })
  @ApiResponse({ status: 409, description: 'Comment already liked by user.' })
  @ApiParam({ name: 'commentId', type: 'string' })
  async like(@Param('commentId') commentId: string, @Req() req: Request) {
    const userId = (req.user as any).sub;
    await this.commentLikesService.like(userId, commentId);
    return { success: true };
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a comment' })
  @ApiResponse({ status: 200, description: 'Like removed successfully.' })
  @ApiResponse({ status: 404, description: 'Like or comment not found.' })
  @ApiParam({ name: 'commentId', type: 'string' })
  async unlike(@Param('commentId') commentId: string, @Req() req: Request) {
    const userId = (req.user as any).sub;
    await this.commentLikesService.unlike(userId, commentId);
    return { success: true };
  }

  @Get('comments/:commentId/status')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current like status for a comment' })
  @ApiResponse({ status: 200, type: CommentLikeStatusDto })
  @ApiParam({ name: 'commentId', type: 'string' })
  async getStatus(
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ): Promise<CommentLikeStatusDto> {
    const userId = req.user ? (req.user as any).sub : null;
    return this.commentLikesService.getStatus(userId, commentId);
  }
}
