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

  async determineScreen(notificationType: NotificationType): Promise<string> {
    switch (notificationType) {
      case NotificationType.ONBOARDING:
        return 'recieverequests';
      case NotificationType.MESSAGE:
        return 'home';
      case NotificationType.FRIEND_REQUEST_RECIEVED:
        return 'recieverequests';
      case NotificationType.FRIEND_REQUEST_ACCEPTED:
        return 'notifications';
      default:
        return 'notifications';
    }
  }

  async sendNotification(
    createdNotification: NotificationDTO,
    fcmToken: string,
    type: NotificationType,
    description: string,
  ): Promise<void> {
    const screen = await this.determineScreen(createdNotification.type);
    let notificationTitle;

    if (type === NotificationType.FRIEND_REQUEST_ACCEPTED || type === NotificationType.FRIEND_REQUEST_RECIEVED) {
      notificationTitle = 'Friend Request';
    } else if (type === NotificationType.ONBOARDING) {
      notificationTitle = 'Yoocha';
    } else {
      notificationTitle = 'New Message';
    }

    const message = {
      notification: {
        title: notificationTitle,
        body: description,
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
      to: dto.to.toString(),
      from: userId.toString(),
      isRead: dto.isRead ?? false,
      fcmToken: dto.fcmToken,
      message: dto.message,
      sendPushNotification: dto.sendPushNotification,
      type: dto.type,
    });

    if (dto.sendPushNotification && dto.fcmToken) {
      await this.sendNotification(createdNotification, dto.fcmToken, dto.type, dto.message);
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
