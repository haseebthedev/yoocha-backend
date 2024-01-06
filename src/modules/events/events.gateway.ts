import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Events } from './enums';

@WebSocketGateway(parseInt(process.env.PORT), { namespace: 'events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

  @SubscribeMessage(Events.MESSAGE)
  handleMessage(client: Socket, payload: { to: string; message: string }) {
    // console.log('token: ' + token);

    console.log('payload === ', payload);
    const { to, message } = payload;

    // Send the message to the specified user
    this.server.to(to).emit('message', { from: client.id, message });
  }
}
