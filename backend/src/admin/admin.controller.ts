import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminQueryDto } from './dto/admin-query.dto';
import { PromoteUserDto } from './dto/promote-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiCommonErrorResponses } from '../common/decorators/api-error-responses.decorator';

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
  promoteUser(
    @Param('userId') userId: string,
    @Body() dto: PromoteUserDto,
  ) {
    return this.adminService.promoteUser(userId, dto.role);
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

  @Delete('episodes/:episodeId')
  @ApiOperation({ summary: 'Remove an episode (cascade)' })
  @ApiResponse({ status: 200, description: 'Episode removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  removeEpisode(@Param('episodeId') episodeId: string) {
    return this.adminService.removeEpisode(episodeId);
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
  @ApiOperation({ summary: 'Get platform stats (users, creators, podcasts, episodes)' })
  @ApiResponse({ status: 200, description: 'Stats object' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStats() {
    return this.adminService.getStats();
  }
}
