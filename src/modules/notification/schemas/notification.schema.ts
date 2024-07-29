import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import * as Paginate from 'mongoose-paginate-v2';
import { NotificationStatus, NotificationType } from 'src/common/enums/notifications.enum';

@Schema()
export class Notification extends BaseSchema {
  @Prop({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  message: string;

  @Prop({ type: String, enum: NotificationType, required: true })
  @IsEnum(NotificationType)
  type: NotificationType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fromUser: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  toUser: Types.ObjectId;

  @Prop({ type: String, enum: NotificationStatus, default: NotificationStatus.SENT })
  @IsEnum(NotificationStatus)
  status: NotificationStatus;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification).set('versionKey', false);

NotificationSchema.plugin(Paginate);
