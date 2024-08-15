import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { NotificationType } from 'src/common/enums/notifications.enum';

export class NotificationDTO {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsMongoId()
  @IsNotEmpty()
  to: Types.ObjectId;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsBoolean()
  @IsOptional()
  sendPushNotification?: boolean;

  @IsString()
  @IsOptional()
  fcmToken?: string;
}
