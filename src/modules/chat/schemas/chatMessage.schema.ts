import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schemas';
import * as Paginate from 'mongoose-paginate-v2';

@Schema()
export class ChatMessage extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', _id: false })
  chatRoomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null, _id: false })
  sender: Types.ObjectId;

  @Prop({ type: String, default: null })
  message: string;

  @Prop({ type: Array<string>, default: null })
  files: string[];

  @Prop({ type: String, enum: ['text', 'image'], default: null })
  type: 'text' | 'image';
}

export type ChatMessageDocument = HydratedDocument<ChatMessage>;
export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage).set('versionKey', false);

ChatMessageSchema.plugin(Paginate);
