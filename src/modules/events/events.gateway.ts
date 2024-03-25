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
import { ChatMessageDocument } from '../chat/schemas';
import { ParticipantI } from 'src/interfaces';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@WebSocketGateway(parseInt(process.env.PORT), { namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    console.log('client connected: ', client.id);

    // const token = client.handshake.headers['authorization'];

    // if (token) {
    //   let decodedUser = await this.authService.verifyToken(token);
    //   const userActiveRooms = await this.chatService.listActiveRoomsIdsByUserId(decodedUser.sub);
    //   const userActiveRoomsIds = userActiveRooms.map((el) => el._id.toString());

    //   await Promise.all(
    //     userActiveRoomsIds.map(async (roomId) => {
    //       // Check if the user is not already joined to the room
    //       if (!client.rooms.has(roomId)) {
    //         await client.join(roomId);
    //         console.log(`Client joined room: ${roomId}`);
    //       }
    //     }),
    //   );
    // }
  }

  handleDisconnect(client: Socket) {
    // Get the list of rooms the client is currently joined to
    const rooms = Array.from(client.rooms.values());

    // Iterate over each room and remove the client from the room
    rooms.forEach((roomId) => {
      client.leave(roomId);
      console.log(`Client left room: ${roomId}`);
    });

    console.log(`Client disconnected: ${client.id}`);
  }

  // @SubscribeMessage(Events.SEND_FRIEND_REQUEST)
  // async onSendFriendRequest(client: Socket, payload: { participants: ParticipantI[] }) {
  //   console.log('payload :--: ', payload);

  //   await this.chatService.createRoom(payload.participants);
  // }

  // @SubscribeMessage(Events.CANCEL_FRIEND_REQUEST)
  // async onCancelFriendRequest(client: Socket, payload: { participants: ParticipantI[] }) {
  //   await this.chatService.deleteRoom(payload.participants);
  // }

  // @SubscribeMessage(Events.JOIN_ROOM)
  // async onJoinRoom(client: Socket, payload: { roomId: string; inviteeId: string }) {
  //   console.log('payload :--: ', payload);

  //   await this.chatService.joinRoom(payload.roomId, payload.inviteeId);
  // }

  // @SubscribeMessage(Events.SEND_MESSAGE)
  // async onSendMessage(client: Socket, payload: ChatMessageDocument) {
  //   const messageResult: any = await this.chatService.sendMessage(String(payload.sender), payload);
  //   const {password, isEmailVerified, authCode, ...senderInfo} = await this.userService.findById(String(messageResult.sender))
  //   messageResult.sender = senderInfo 
  //   this.server.to(String(payload.chatRoomId)).emit(Events.RECEIVE_MESSAGE, { ...messageResult });
  // }
}
