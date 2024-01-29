import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Events } from './enums';
import { ChatService } from '../chat/chat.service';
import { Types } from 'mongoose';
import { ChatMessageDocument } from '../chat/schemas';

type ParticipantI = { user: Types.ObjectId; role: string }[];

@WebSocketGateway(parseInt(process.env.PORT), { namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) {}

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    // const token = client.handshake.headers['authorization'];
    // console.log('token: ' + token);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // const token = client.handshake.headers['authorization'];
    // console.log('token: ' + token);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(Events.SEND_FRIEND_REQUEST)
  async onSendFriendRequest(client: Socket, payload: { participants: ParticipantI }) {
    console.log('payload :--: ', payload);

    await this.chatService.createRoom(payload.participants);
  }

  @SubscribeMessage(Events.JOIN_ROOM)
  async onJoinRoom(client: Socket, payload: { roomId: string; inviteeId: string }) {
    console.log('payload :--: ', payload);

    await this.chatService.joinRoom(payload.roomId, payload.inviteeId);
  }

  @SubscribeMessage(Events.SEND_MESSAGE)
  async onSendMessage(client: Socket, payload: ChatMessageDocument) {
    // console.log('token: ' + token);

    await this.chatService.sendMessage(String(payload.sender), payload);

    // Send the message to the specified user
    // this.server.to(to).emit('message', { from: client.id, message });
  }
}
