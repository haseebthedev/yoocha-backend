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
import { TokenService } from '../token/token.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: PaginateModel<Notification>,
    private readonly firebaseAdminService: FirebaseAdminService,
    private userService: UserService,
    private readonly tokenService: TokenService,
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

  async sendPushNotification(
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
      notificationTitle = 'Welcome to Yoocha';
    } else {
      notificationTitle = 'New Message';
    }

    const message = {
      notification: {
        title: notificationTitle || 'Yoocha',
        body: description || '',
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
      console.log(message);
    } catch (error) {
      // throw new BadRequestException('Failed to send push notification');

      if (error.code === 'messaging/registration-token-not-registered') {
        // Token is no longer valid, remove it from the database
        try {
          await this.tokenService.removeToken(createdNotification.to.toString(), fcmToken);
          console.log(`Removed invalid FCM token: ${fcmToken} for userId: ${createdNotification.to}`);
        } catch (removalError) {
          console.error('Failed to remove invalid FCM token:', removalError);
        }
      } else {
        throw new BadRequestException('Failed to send push notification');
      }
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
      await this.sendPushNotification(createdNotification, dto.fcmToken, dto.type, dto.message);
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
