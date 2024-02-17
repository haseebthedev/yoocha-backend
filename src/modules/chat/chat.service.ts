import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatRoom, ChatMessage } from './schemas';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { ChatRoomState } from './enums/room.enum';
import { CustomError } from 'src/common/errors/api.error';
import { ParticipantI } from 'src/interfaces';
import { ParticipantType } from 'src/common/enums/user.enum';
import { User } from '../user/schemas/user.schema';
import { ListUserRequestsDto } from './dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: PaginateModel<ChatRoom>,
    @InjectModel(ChatMessage.name) private ChatMessageModel: PaginateModel<ChatMessage>,
    private userService: UserService,
  ) {}

  async roomAlreadyExists(firstUser: Types.ObjectId | string, secondUser: Types.ObjectId | string): Promise<boolean> {
    const room = await this.chatRoomModel.findOne({
      $and: [
        {
          'participants.user': firstUser,
          'participants.role': { $in: ['INITIATOR', 'INVITEE'] },
        },
        {
          'participants.user': secondUser,
          'participants.role': { $in: ['INITIATOR', 'INVITEE'] },
        },
      ],
    });

    return !!room;
  }

  async createRoom(participants: ParticipantI[]) {
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
    const room = await this.chatRoomModel.findById(roomId);

    if (!room) throw new NotFoundException('Room not found');

    // Check if the user is an INVITEE in the room
    const isInvitee = room.participants.some(
      (item) => item.user.toString() === inviteeUserId && item.role === ParticipantType.INVITEE,
    );

    if (!isInvitee) throw new NotFoundException('User is not an INVITEE in this room');

    // Update the room status to 'ACTIVE'
    room.status = 'ACTIVE';

    await room.save();
    return room;
  }

  async deleteRoom() {}

  async sendMessage(senderId: string, payload: ChatMessage) {
    const message = await this.ChatMessageModel.create({
      sender: senderId,
      chatRoomId: payload.chatRoomId,
      files: payload.files,
      link: payload.files,
      message: payload.message,
    });

    await message.save();
    return message;
  }

  async listMessages(roomId: string, paginateOptions?: PaginateOptions) {
    if (!roomId) {
      throw new HttpException('RoomId is invalid or null', HttpStatus.BAD_REQUEST);
    }

    const query: FilterQuery<ChatMessage> = {
      chatRoomId: roomId,
    };

    return await this.ChatMessageModel.paginate(query, paginateOptions);
  }

  async listRooms(userId: string, paginateOptions?: PaginateOptions) {
    const query: FilterQuery<ChatMessage> = {
      'participants.user': userId,
      status: ChatRoomState.ACTIVE,
    };

    return await this.chatRoomModel.paginate(query, paginateOptions);
  }

  async listActiveRoomsIdsByUserId(userId: string) {
    return await this.chatRoomModel.find({ status: 'ACTIVE', 'participants.user': userId }, { _id: 1 });
  }

  async friendSuggestions(userId: string, users: User[]) {
    const possibleFriends = await Promise.all(
      users
        .filter(async (user) => !(await this.roomAlreadyExists(userId, user._id)) ?? user)
        .filter((user) => String(user._id) !== userId),
    );
    return possibleFriends;
  }

  async listUserRequests(userId: string, body: ListUserRequestsDto, paginateOptions?: PaginateOptions) {
    const query: FilterQuery<ChatMessage> = {
      status: ChatRoomState.PENDING,
      participants: {
        $elemMatch: {
          user: userId,
          role: body.role,
        },
      },
    };

    const result: any = await this.chatRoomModel.paginate(query, paginateOptions);
    const modifiedDocs = result.docs.map((room) => {
      const user = room.participants.find((participant) => String(participant.user._id) !== userId).user;
      return {
        ...room.toObject(),
        user: user,
        participants: undefined,
      };
    });

    result.docs = modifiedDocs;
    return result;
  }
}
