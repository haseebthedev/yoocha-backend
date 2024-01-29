import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatRoom, ChatMessage } from './schemas';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { ChatRoomState } from './enums/room.enum';
import { ErrorMessage } from 'src/common/enums/error.enum';
import { CustomError } from 'src/common/errors/api.error';

type ParticipantI = { user: Types.ObjectId; role: string }[];

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: PaginateModel<ChatRoom>,
    @InjectModel(ChatMessage.name) private ChatMessageModel: PaginateModel<ChatMessage>,
    private userService: UserService,
  ) {}

  async roomAlreadyExists(user1: Types.ObjectId, user2: Types.ObjectId): Promise<boolean> {
    const room = await this.chatRoomModel.findOne({
      $and: [
        {
          'participants.user': user1,
          'participants.role': { $in: ['INITIATOR', 'INVITEE'] },
        },
        {
          'participants.user': user2,
          'participants.role': { $in: ['INITIATOR', 'INVITEE'] },
        },
      ],
    });

    return !!room;
  }

  async createRoom(participants: ParticipantI) {
    const users = participants.map((el) => el.user);

    // Fetch users in parallel
    const [user1, user2] = await Promise.all([
      this.userService.findById(users[0].toString()),
      this.userService.findById(users[1].toString()),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('One or more users not found');
    }

    // Check if a room already exists with these participants
    const roomAlreadyExists = await this.roomAlreadyExists(users[0], users[1]);
    if (roomAlreadyExists) {
      throw new ConflictException(`Room already exists`);
    }

    const room = await this.chatRoomModel.create({ participants });
    return room;
  }

  async joinRoom(roomId: string, inviteeUserId: string) {
    console.log('inviteeUserId === ', inviteeUserId);

    // Fetch the room by its ID
    const room = await this.chatRoomModel.findById(roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if the user is an INVITEE in the room
    const isInvitee = room.participants.some(
      (item) => item.user.toString() === inviteeUserId && item.role === 'INVITEE',
    );

    if (!isInvitee) {
      throw new NotFoundException('User is not an INVITEE in this room');
    }

    // Update the room status to 'ACTIVE'
    room.status = 'ACTIVE';

    // Save the updated room
    await room.save();
    return room;
  }

  async deleteRoom() {}

  async sendMessage(senderId: string, payload: ChatMessage) {
    try {
      const message = await this.ChatMessageModel.create({
        sender: senderId,
        chatRoomId: payload.chatRoomId,
        files: payload.files,
        link: payload.files,
        message: payload.message,
      });

      message.save();
    } catch (error) {
      throw new HttpException(ErrorMessage.SERVER_ERROR, 500);
    }
  }

  async listMessages(roomId: string, paginateOptions?: PaginateOptions) {
    try {
      if (!roomId) {
        throw new CustomError('RoomId is invalid or null', HttpStatus.BAD_REQUEST);
      }

      const query: FilterQuery<ChatMessage> = {
        chatRoomId: roomId,
      };

      return await this.ChatMessageModel.paginate(query, paginateOptions);
    } catch (error) {
      throw new HttpException(ErrorMessage.SERVER_ERROR, 500);
    }
  }

  async listRooms(userId: string, paginateOptions?: PaginateOptions) {
    try {
      const query: FilterQuery<ChatMessage> = {
        'participants.user': userId,
        status: ChatRoomState.ACTIVE,
      };

      return await this.chatRoomModel.paginate(query, paginateOptions);
    } catch (error) {
      throw new HttpException(ErrorMessage.SERVER_ERROR, 500);
    }
  }
}
