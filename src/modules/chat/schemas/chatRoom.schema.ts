import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import { ChatRoomState } from '../enums/room.enum';
import * as Paginate from 'mongoose-paginate-v2';

@Schema()
export class ChatRoom extends BaseSchema {
  @Prop({ default: ChatRoomState.PENDING, enum: ChatRoomState })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  initiator: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  invitee: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, required: false })
  blockedBy: string

  @Prop({ type: String, default: null })
  lastMessage: string;
}

export type ChatRoomDocument = HydratedDocument<ChatRoom>;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom).set('versionKey', false);

ChatRoomSchema.plugin(Paginate);
