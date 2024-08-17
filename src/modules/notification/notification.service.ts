import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginateModel, PaginateOptions } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schemas/notification.schema';
import { NotificationDTO } from './dto';
import { FilterQuery } from 'mongoose';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { UserService } from '../user/user.service';
import { NotificationType } from 'src/common/enums/notifications.enum';
import { capitalize } from 'src/common/utils/formatString';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: PaginateModel<Notification>,
    private readonly firebaseAdminService: FirebaseAdminService,
    private userService: UserService,
  ) {}

  async determineScreen(notificationType: NotificationType): Promise<any> {
    switch (notificationType) {
      case NotificationType.ONBOARDING:
        return 'recieverequests';
      case NotificationType.MESSAGE:
        return 'recieverequests';
      case NotificationType.FRIEND_REQUEST_RECIEVED:
        return 'recieverequests';
      case NotificationType.FRIEND_REQUEST_RECIEVED:
        return 'recieverequests';
      default:
        return 'notifications';
    }
  }

  async sendNotification(
    createdNotification: NotificationDTO,
    fcmToken: string,
    title: string,
    body: string,
  ): Promise<void> {
    const screen = await this.determineScreen(createdNotification.type);

    const message = {
      notification: {
        title,
        body,
      },
      android: {
        notification: {
          color: '#f45342',
          sound: 'default',
        },
      },
      data: {
        screen,
      },
      token: fcmToken,
    };

    try {
      await this.firebaseAdminService.getFirebaseApp().messaging().send(message);
    } catch (error) {
      throw new BadRequestException('Failed to send push notification');
    }
  }

  async createNotification(dto: NotificationDTO, userId: string): Promise<Notification> {
    const user = await this.userService.findById(userId);
    const senderName = `${capitalize(user.firstname)} ${capitalize(user.lastname)}`;

    if (!dto.to || !dto.message || !dto.type) {
      throw new BadRequestException('You are missing required fields!');
    }
    const createdNotification = new this.notificationModel({
      ...dto,
      to: dto.to.toString(),
      from: userId.toString(),
      isRead: dto.isRead ?? false,
    });

    if (dto.sendPushNotification && dto.fcmToken) {
      await this.sendNotification(createdNotification, dto.fcmToken, senderName, dto.message);
    }

    return createdNotification.save();
  }

  async getNotifications(userId: string, paginateOptions?: PaginateOptions): Promise<any> {
    const query: FilterQuery<Notification> = {
      to: userId.toString(),
    };

    const options = {
      ...paginateOptions,
      sort: { createdAt: -1 },
    };

    return await this.notificationModel.paginate(query, options);
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification.populate('from to');
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
