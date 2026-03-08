import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    UseGuards,
    DefaultValuePipe,
    ParseIntPipe,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { PaginatedNotificationsDto } from './dto/paginated-notifications.dto';
import { UnreadCountDto } from './dto/notification-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get paginated notifications for current user' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiResponse({ status: 200, type: PaginatedNotificationsDto })
    async getNotifications(
        @CurrentUser('id') userId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        if (limit > 100) {
            throw new BadRequestException('Limit cannot exceed 100');
        }
        const result = await this.notificationsService.getNotifications(
            new Types.ObjectId(userId),
            page,
            limit,
        );
        return { statusCode: 200, data: result };
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count for current user' })
    @ApiResponse({ status: 200, type: UnreadCountDto })
    async getUnreadCount(@CurrentUser('id') userId: string) {
        const count = await this.notificationsService.getUnreadCount(
            new Types.ObjectId(userId),
        );
        return { statusCode: 200, data: { unreadCount: count } };
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read for current user' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read' })
    async markAllAsRead(@CurrentUser('id') userId: string) {
        await this.notificationsService.markAllAsRead(
            new Types.ObjectId(userId),
        );
        return { statusCode: 200, message: 'All notifications marked as read' };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a specific notification as read' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid notification ID');
        }
        const success = await this.notificationsService.markAsRead(
            new Types.ObjectId(id),
            new Types.ObjectId(userId),
        );
        if (!success) {
            return { statusCode: 404, message: 'Notification not found or already read' };
        }
        return { statusCode: 200, message: 'Notification marked as read' };
    }
}
