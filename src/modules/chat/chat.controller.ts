import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards';
import { GetUser } from 'src/common/decorators';
import { MongoIdValidationPipe } from 'src/common/pipes/mongo-id.pipe';
import { UserService } from '../user/user.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private userService: UserService,
  ) {}

  @Get('send-friend-req')
  async sendFriendReq(
    @GetUser('id', MongoIdValidationPipe) initiatorId: string,
    @Query('inviteeId', MongoIdValidationPipe) inviteeId: string,
  ) {
    const roomCreated = await this.chatService.createRoom(initiatorId, inviteeId);
    if (roomCreated) {
      return { status: 'Your request has been sent' };
    }
  }

  @Get('accept-friend-req')
  async acceptFriendReq(
    @GetUser('id', MongoIdValidationPipe) inviteeId: string,
    @Query('roomId', MongoIdValidationPipe) roomId: string,
  ) {
    const requestAccepted = await this.chatService.joinRoom(roomId, inviteeId);

    if (requestAccepted) {
      return { status: 'User request accepted successfully' };
    }
  }

  @Get('list-user-requests')
  async listUserRequests(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.chatService.listUserRequests(userId, { page, limit });
  }

  @Post('list-rooms')
  async listRooms(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.chatService.listRooms(userId, { page, limit });
  }

  @Get('list-blocked-users')
  async listBlockedUsers(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.chatService.listBlockedUsers(userId, { page, limit });
  }

  @Patch('block-user')
  async blockUser(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('id', MongoIdValidationPipe) userIdToBlock: string,
  ) {
    return await this.chatService.blockUser(userId, userIdToBlock);
  }

  @Patch('unblock-user')
  async unBlockUser(
    @GetUser('id', MongoIdValidationPipe) userId: string,
    @Query('id', MongoIdValidationPipe) userIdToUnblock: string,
  ) {
    return await this.chatService.unBlockUser(userId, userIdToUnblock);
  }

  @Post('list-messages')
  async listMessages(
    @Body('roomId', MongoIdValidationPipe) roomId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.chatService.listMessages(roomId, { page, limit, populate: 'sender' });
  }

  //  -----------------------------------------------------

  // @Get('friend-suggestions')
  // async friendSuggestions(@GetUser('id', MongoIdValidationPipe) userId: string) {
  //   // const users = await this.userService.findAll();
  //   const suggestions = await this.chatService.friendSuggestions(userId);
  //   return { users: suggestions.slice(0, 15) };
  // }

  // @Get('list-blocked-users')
  // async listBlockedUsers(
  //   @GetUser('id', MongoIdValidationPipe) userId: string,
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  // ) {
  //   return await this.chatService.listBlockedUsers(userId, { page, limit, populate: 'participants.user' });
  // }

  // @Patch('unblock-user')
  // async unBlockUser(
  //   @GetUser('id', MongoIdValidationPipe) userId: string,
  //   @Query('id', MongoIdValidationPipe) userIdToBlock: string,
  // ) {
  //   return await this.chatService.unBlockUser(userId, userIdToBlock);
  // }
}
