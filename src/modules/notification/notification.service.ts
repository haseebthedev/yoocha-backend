import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginateModel, PaginateOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schemas/notification.schema';
import { NotificationDTO } from './dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(@InjectModel(Notification.name) private notificationModel: PaginateModel<Notification>) {}

  async createNotification(dto: NotificationDTO): Promise<Notification> {
    if (!dto.recipientId || !dto.senderId || !dto.message)
      throw new BadRequestException(`You are missing Required Field!`);

    const createdNotification = new this.notificationModel(dto);
    return createdNotification.save();
  }

  async getNotifications(userId: string, paginateOptions?: PaginateOptions): Promise<any> {
    const query: FilterQuery<Notification> = {
      recipientId: userId.toString(),
    };

    return await this.notificationModel.paginate(query, paginateOptions);
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification.populate('senderId recipientId');
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
