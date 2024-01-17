import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';

@Schema()
export class ChatMessage extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom' })
  chatRoomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender: Types.ObjectId;

  @Prop({ type: String })
  message: string;

  @Prop({ type: String })
  link: string;

  @Prop({ type: Array<string> })
  files: string[];
}

export type ChatMessageDocument = HydratedDocument<ChatMessage>;
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage).set(
  'versionKey',
  false,
);
