import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatModule } from '../Chat/chat.module';

@Module({
  imports: [ChatModule],
  providers: [EventsGateway],
})
export class EventsModule {}
