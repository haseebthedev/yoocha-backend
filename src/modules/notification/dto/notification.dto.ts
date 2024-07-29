import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { NotificationStatus, NotificationType } from 'src/common/enums/notifications.enum';

export class NotificationDTO {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsMongoId()
  @IsNotEmpty()
  fromUser: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  toUser: Types.ObjectId;

  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @IsOptional()
  isRead?: boolean;
}
