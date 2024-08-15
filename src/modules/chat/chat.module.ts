import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema, ChatRoom, ChatRoomSchema } from './schemas';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { EventsModule } from '../events/events.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    UserModule,
    NotificationModule,
    forwardRef(() => EventsModule),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
