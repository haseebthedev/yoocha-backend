import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { ChatService } from '../chat/chat.service';

@Module({
  imports: [forwardRef(() => ChatModule), AuthModule, UserModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
