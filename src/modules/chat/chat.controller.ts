import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';
import { UserService } from '../user/user.service';
import { ListUserRequestsDto } from './dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  @Post('list-messages')
  async listMessages(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Body('roomId', MongoIdValidationPipe) roomId: string,
  ) {
    return await this.chatService.listMessages(roomId, { page, limit, populate: 'sender' });
  }

  @Post('list-rooms')
  async listMyRooms(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @GetUser('id', MongoIdValidationPipe) userId: string,
  ) {
    return await this.chatService.listRooms(userId, { page, limit, populate: 'participants.user' });
  }

  @Get('friend-suggestions')
  async friendSuggestions(@GetUser('id', MongoIdValidationPipe) userId: string) {
    const users = await this.userService.findAll();
    const suggestions = await this.chatService.friendSuggestions(userId, users);
    return { doc: suggestions.slice(0, 10) };
  }

  @Post('list-user-requests')
  async listUserRequests(
    @Body() body: ListUserRequestsDto,
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.chatService.listUserRequests(userId, body, { page, limit, populate: 'participants.user' });
  }
}
