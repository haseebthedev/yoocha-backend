import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatRoom, ChatMessage } from './schemas';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { ChatRoomState } from './enums/room.enum';
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

  async roomAlreadyExists(initiatorId: string, inviteeId: string): Promise<boolean> {
    const participants = new Set([initiatorId, inviteeId]);
    const existingRoom = await this.chatRoomModel
      .findOne({
        initiator: { $in: [...participants] },
        invitee: { $in: [...participants] },
      })
      .exec();

    return !!existingRoom;
  }

  async createRoom(initiatorId: string, inviteeId: string) {
    const existingRoom = await this.roomAlreadyExists(initiatorId, inviteeId);

    if (existingRoom) {
      throw new HttpException('Room already exists between these users', HttpStatus.BAD_REQUEST);
    }

    // If no room exists, create a new one
    const newRoom = new this.chatRoomModel({ initiator: initiatorId, invitee: inviteeId });
    return newRoom.save();
  }

  async joinRoom(roomId: string, inviteeId: string) {
    const room = await this.chatRoomModel.findById(roomId);

    if (!room) throw new NotFoundException('Chatroom not found');

    if (String(room.invitee) !== inviteeId) throw new NotFoundException('User is not an invitee in this room');

    room.status = ChatRoomState.ACTIVE;
    await room.save();
    return room;
  }

  async listUserRequests(userId: string, paginateOptions?: PaginateOptions) {
    const query: FilterQuery<ChatRoom> = {
      status: ChatRoomState.PENDING,
      invitee: userId,
    };
    return await this.chatRoomModel.paginate(query, paginateOptions);
  }

  async listRooms(userId: string, paginateOptions?: PaginateOptions) {
    const query: FilterQuery<ChatRoom> = {
      status: ChatRoomState.ACTIVE,
      $or: [{ initiator: { $eq: userId } }, { invitee: { $eq: userId } }],
    };

    return await this.chatRoomModel.paginate(query, paginateOptions);
  }

  async listBlockedUsers(userId: string, paginateOptions?: PaginateOptions) {
    const query: FilterQuery<ChatRoom> = {
      status: String(ChatRoomState.BLOCKED),
      blockedBy: userId,
    };

    const result: any = await this.chatRoomModel.paginate(query, paginateOptions);
    return result;
  }

  async blockUser(userId: string, userIdToBlock: string) {
    const room = await this.chatRoomModel.findOne({
      status: ChatRoomState.ACTIVE,
      $or: [
        { initiator: userId, invitee: userIdToBlock },
        { initiator: userIdToBlock, invitee: userId },
      ],
    });

    if (!room) throw new NotFoundException("You don't have any active chat with this user");

    room.blockedBy = userId;
    room.status = ChatRoomState.BLOCKED;

    await room.save();
    return { status: 'User has been blocked successfully' };
  }

  async unBlockUser(userId: string, userIdToUnblock: string) {
    const room = await this.chatRoomModel.findOne({
      status: ChatRoomState.BLOCKED,
      $or: [
        { initiator: userId, invitee: userIdToUnblock, blockedBy: userId },
        { initiator: userIdToUnblock, invitee: userId, blockedBy: userId },
      ],
    });

    if (!room) {
      throw new NotFoundException('User not found or already unblocked');
    }

    room.blockedBy = null;
    room.status = ChatRoomState.ACTIVE;
    await room.save();

    return { message: 'User has been unblocked successfully' };
  }

  async listMessages(roomId: string, paginateOptions?: PaginateOptions) {
    const room = await this.chatRoomModel.findOne({ _id: roomId });
    if (!room) throw new HttpException(`RoomId is invalid or doesn't exists`, HttpStatus.BAD_REQUEST);

    const query: FilterQuery<ChatMessage> = { chatRoomId: roomId };
    return await this.ChatMessageModel.paginate(query, paginateOptions);
  }

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

  //  ABOVE CODE IS ERROR FREE AND NEW

  async listActiveRoomsIdsByUserId(userId: string) {
    return await this.chatRoomModel.find({ status: ChatRoomState.ACTIVE, 'participants.user': userId }, { _id: 1 });
  }

  async friendSuggestions(userId: string): Promise<User[]> {
    // Get all users except the current user
    const allUsers = await this.userService.findAll({ _id: { $ne: userId } });

    const possibleFriends = await Promise.all(
      allUsers.map(async (user) => {
        const roomExists = await this.roomAlreadyExists(userId, user._id);
        return roomExists ? null : user;
      }),
    );
    return possibleFriends.filter(Boolean);
  }
}
