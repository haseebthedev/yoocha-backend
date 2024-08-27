import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { FilterQuery, PaginateModel, PaginateOptions, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ParticipantType } from 'src/common/enums/user.enum';
import { UserService } from '../user/user.service';
import { ChatRoomState } from './enums/room.enum';
import { SendMessagePayloadDto } from './dto';
import { ChatRoom, ChatMessage } from './schemas';
import { EventsGateway } from '../events/events.gateway';
import { Events } from '../events/enums';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from 'src/common/enums/notifications.enum';
import { CreateTokenDto } from '../token/dto/create-token.dto';
import { Token } from '../token/schemas/token.schema';
import { TokenService } from '../token/token.service';
import { capitalize } from 'src/common/utils/formatString';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Token.name) private tokenModel: PaginateModel<Token>,
    @InjectModel(ChatRoom.name) private chatRoomModel: PaginateModel<ChatRoom>,
    @InjectModel(ChatMessage.name) private ChatMessageModel: PaginateModel<ChatMessage>,
    private userService: UserService,
    private readonly notificationService: NotificationService,

    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
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

  async createNotification(initiatorId: string, tokens: Token[], message: string, type: NotificationType) {
    for (const token of tokens) {
      await this.notificationService.createNotification(
        {
          message,
          type,
          to: new Types.ObjectId(token.userId),
          isRead: false,
          sendPushNotification: true,
          fcmToken: token.token,
        },
        initiatorId,
      );
    }
  }

  async createRoom(initiatorId: string, inviteeId: string) {
    const user = await this.userService.findById(initiatorId);
    const senderName = `${capitalize(user.firstname)} ${capitalize(user.lastname)}`;
    const tokens = await this.tokenModel.find({ userId: inviteeId });

    const existingRoom = await this.roomAlreadyExists(initiatorId, inviteeId);

    if (existingRoom) {
      throw new HttpException('Room already exists between these users', HttpStatus.BAD_REQUEST);
    }

    // If no room exists, create a new one
    const newRoom = new this.chatRoomModel({ initiator: initiatorId, invitee: inviteeId });
    await newRoom.save();

    if (tokens.length > 0) {
      await this.createNotification(
        initiatorId,
        tokens,
        `${senderName} sent you friend request.`,
        NotificationType.FRIEND_REQUEST_RECIEVED,
      );
    }

    return newRoom;
  }

  async joinRoom(roomId: string, inviteeId: string) {
    const room = await this.chatRoomModel.findById(roomId);
    const user = await this.userService.findById(room.initiator);
    const senderName = `${capitalize(user.firstname)} ${capitalize(user.lastname)}`;
    const tokens = await this.tokenModel.find({ userId: room.initiator });

    if (!room) throw new NotFoundException('Chatroom not found');

    if (String(room.invitee) !== inviteeId) throw new NotFoundException('User is not an invitee in this room');

    room.status = ChatRoomState.ACTIVE;
    await room.save();

    if (tokens.length > 0) {
      await this.createNotification(
        room.invitee,
        tokens,
        `${senderName} accepted your friend request.`,
        NotificationType.FRIEND_REQUEST_ACCEPTED,
      );
    }

    return room;
  }

  async deleteRoom(initiatorId: string, inviteeId: string) {
    const roomToDelete = await this.chatRoomModel
      .findOneAndDelete({
        initiator: initiatorId,
        invitee: inviteeId,
      })
      .exec();

    if (!roomToDelete) {
      throw new HttpException(`You haven't send request to this user `, HttpStatus.NOT_FOUND);
    }

    return roomToDelete;
  }

  async listUserRequests(userId: string, type: keyof typeof ParticipantType, paginateOptions?: PaginateOptions) {
    const query: FilterQuery<ChatRoom> = { status: ChatRoomState.PENDING };

    if (type === ParticipantType.INITIATOR) {
      query.initiator = userId;
    }

    if (type === ParticipantType.INVITEE) {
      query.invitee = userId;
    }

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

    return await this.chatRoomModel.paginate(query, paginateOptions);
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

  async sendMessage(roomId: string, senderId: string, payload: SendMessagePayloadDto) {
    const room = await this.chatRoomModel.findById(roomId);
    const to = room.initiator === senderId ? room.invitee : room.initiator;

    const tokens = await this.tokenModel.find({ userId: to });

    const message = await this.ChatMessageModel.create({
      chatRoomId: roomId,
      sender: senderId,
      files: payload?.files,
      message: payload?.message,
      type: payload?.type || 'text',
    });

    // console.log('sendMessage....');

    await message.save();
    await message.populate('sender');

    // Check if it's the first message in the room create notification
    const messageCount = await this.ChatMessageModel.countDocuments({ chatRoomId: roomId });
    if (messageCount === 1 && tokens.length > 0) {
      await this.createNotification(senderId, tokens, `Sent you a message.`, NotificationType.MESSAGE);
    }

    // sending this event to server
    // console.log('roomId: ', roomId, 'message: ', message);
    this.eventsGateway.server.to(String(roomId)).emit(Events.RECEIVE_MESSAGE, { ...message });
    // this.eventsGateway.server.emit(Events.RECEIVE_MESSAGE, { ...message });

    if (payload?.message) {
      await this.chatRoomModel.findByIdAndUpdate(roomId, { lastMessage: payload.message });
    }

    return message;
  }

  async friendSuggestions(userId: string, paginateOptions?: PaginateOptions) {
    // Find user's friends
    const userFriends = await this.chatRoomModel
      .find({
        $or: [{ initiator: userId }, { invitee: userId }],
      })
      .select('initiator invitee');

    const friendsIds = userFriends.map((friendship) =>
      friendship.initiator === userId ? friendship.invitee : friendship.initiator,
    );

    // Find friends of friends
    const friendsOfFriends = await this.chatRoomModel
      .find({
        $or: [{ initiator: { $in: friendsIds } }, { invitee: { $in: friendsIds } }],
        status: ChatRoomState.ACTIVE,
      })
      .select('initiator invitee');

    const suggestedFriendsIds = friendsOfFriends.reduce((acc, friendship) => {
      const friendId = friendsIds.includes(friendship.initiator) ? friendship.invitee : friendship.initiator;

      if (friendId !== userId) {
        acc.add(friendId);
      }
      return acc;
    }, new Set());

    // Fetch user details of suggested friends
    return await this.userService.find(
      {
        _id: { $in: Array.from(suggestedFriendsIds), $nin: Array.from(friendsIds) },
      },
      paginateOptions,
    );
  }

  async explorePeople(userId: string, name: string, paginateOptions?: PaginateOptions) {
    const userInfo = await this.userService.findById(userId);

    // Find user's friends
    const userFriends = await this.chatRoomModel
      .find({
        $or: [{ initiator: userId }, { invitee: userId }],
      })
      .select('initiator invitee');

    const friendsIds = userFriends.map((friendship) =>
      friendship.initiator === userId ? friendship.invitee : friendship.initiator,
    );

    // Find friends of friends
    const friendsOfFriends = await this.chatRoomModel
      .find({
        $or: [{ initiator: { $in: friendsIds } }, { invitee: { $in: friendsIds } }],
      })
      .select('initiator invitee');

    const suggestedFriendsIds = friendsOfFriends.reduce((acc, friendship) => {
      const friendId = friendsIds.includes(friendship.initiator) ? friendship.invitee : friendship.initiator;
      acc.add(friendId);
      return acc;
    }, new Set());

    // Add current user's ID to exclude from suggestions
    suggestedFriendsIds.add(userId);

    // Create the base search criteria
    let searchCriteria: any = {
      $and: [
        { _id: { $nin: Array.from([...suggestedFriendsIds, ...friendsIds]) } }, // Not in friends or friends of friends
        {
          $or: [
            { city: userInfo.city }, // Same city
            { country: userInfo.country }, // Same country
          ],
        },
      ],
    };

    if (name) {
      searchCriteria.$and.push({
        $or: [{ firstname: new RegExp(name, 'i') }, { lastname: new RegExp(name, 'i') }],
      });
    }

    // Fetch users who are not in the current user's friends list or friends of friends,
    // and are in the same city or country
    return await this.userService.find(searchCriteria, paginateOptions);
  }

  async listActiveRoomsIdsByUserId(userId: string): Promise<string[]> {
    const activeRooms = await this.chatRoomModel
      .find({
        status: ChatRoomState.ACTIVE,
        $or: [{ initiator: userId }, { invitee: userId }],
      })
      .select('_id');
    return activeRooms.map((room) => room._id.toString());
  }
}
