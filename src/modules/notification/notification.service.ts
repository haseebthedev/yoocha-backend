import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginateModel, PaginateOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schemas/notification.schema';
import { NotificationDTO } from './dto';
import { FilterQuery } from 'mongoose';
import { NotificationStatus } from 'src/common/enums/notifications.enum';

@Injectable()
export class NotificationService {
  constructor(@InjectModel(Notification.name) private notificationModel: PaginateModel<Notification>) {}

  async createNotification(dto: NotificationDTO): Promise<Notification> {
    if (!dto.toUser || !dto.fromUser || !dto.message || !dto.type) {
      throw new BadRequestException('You are missing required fields!');
    }
    const createdNotification = new this.notificationModel({
      ...dto,
      status: dto.status || NotificationStatus.SENT,
      isRead: dto.isRead ?? false,
    });

    return createdNotification.save();
  }

  async getNotifications(userId: string, paginateOptions?: PaginateOptions): Promise<any> {
    const query: FilterQuery<Notification> = {
      toUser: userId.toString(),
    };

    return await this.notificationModel.paginate(query, paginateOptions);
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification.populate('fromUser toUser');
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;
    return notification.save();
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    const result = await this.notificationModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }
    return { message: 'Notification deleted successfully' };
  }
}
