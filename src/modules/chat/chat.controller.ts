import { Body, Controller, DefaultValuePipe, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('list-messages')
  @UseGuards(JwtAuthGuard)
  async listMessages(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Body('roomId', MongoIdValidationPipe) roomId: string,
  ) {
    return await this.chatService.listMessages(roomId, { page, limit });
  }

  @Post('list-rooms')
  @UseGuards(JwtAuthGuard)
  async listMyRooms(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @GetUser('id', MongoIdValidationPipe) userId: string,
  ) {
    return await this.chatService.listRooms(userId, { page, limit });
  }
}
