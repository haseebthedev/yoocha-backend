import { Controller, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('list')
  async listMessages(@Query('page') page?: number, @Query('limit') limit?: number) {
    return await this.chatService.listMessages({}, { page, limit });
  }
}
