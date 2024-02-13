import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ChatModule, AuthModule, UserModule],
  providers: [EventsGateway],
})
export class EventsModule {}
