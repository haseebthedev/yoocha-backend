import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

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
    role: 'INITIATOR' | 'INVITEE';
  }>;

  @Prop({ default: 'PENDING', required: false })
  status: 'ACTIVE' | 'PENDING';
}

export type ChatRoomDocument = HydratedDocument<ChatRoom>;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom).set(
  'versionKey',
  false,
);
