import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Claims')
@Controller()
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post('podcasts/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request ownership claim for external podcast' })
  @ApiResponse({ status: 202, description: 'Verification email sent' })
  @ApiBody({
    schema: { type: 'object', properties: { podcastId: { type: 'string' } } },
  })
  async requestClaim(
    @Body('podcastId') podcastId: string,
    @CurrentUser('id') userId: string,
  ) {
    const request = await this.claimsService.createRequest(userId, podcastId);
    return {
      statusCode: 202,
      message: 'Verification email sent',
      claimId: request._id,
    };
  }

  @Get('claims/verify/:token')
  @Public()
  @ApiOperation({ summary: 'Verify claim request via email link' })
  @ApiResponse({ status: 200, description: 'Podcast claimed successfully' })
  async verifyClaim(@Param('token') token: string) {
    const result = await this.claimsService.verify(token);
    return {
      statusCode: 200,
      ...result,
    };
  }
}
