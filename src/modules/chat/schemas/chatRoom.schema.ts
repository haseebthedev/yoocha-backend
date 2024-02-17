import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import * as Paginate from 'mongoose-paginate-v2';
import { ParticipantType } from 'src/common/enums/user.enum';
import { ChatRoomState } from '../enums/room.enum';

@Schema()
export class ChatRoom extends BaseSchema {
  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        role: { type: String },
        _id: false,
      },
    ],
  })
  participants: Array<{
    user: Types.ObjectId;
    role: keyof typeof ParticipantType;
  }>;

  @Prop({ default: ChatRoomState.PENDING, required: false, enum: ChatRoomState })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, required: false })
  blockedBy: string
}

export type ChatRoomDocument = HydratedDocument<ChatRoom>;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom).set('versionKey', false);

ChatRoomSchema.plugin(Paginate);
