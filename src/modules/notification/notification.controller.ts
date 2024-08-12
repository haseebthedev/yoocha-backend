import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards';
import { NotificationDTO } from './dto';
import { GetUser } from 'src/common/decorators';
import { User } from '../user/schemas/user.schema';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('create-notification')
  async createNotification(@Body() dto: NotificationDTO) {
    return await this.notificationService.createNotification(dto);
  }

  @Get('list-notifications')
  async getNotifications(
    @GetUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.notificationService.getNotifications(user._id, {
      page,
      limit,
      populate: 'fromUser toUser',
    });
  }

  @Get(':id')
  async getNotificationById(@Param('id') id: string) {
    return this.notificationService.getNotificationById(id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.deleteNotification(id);
  }
}
