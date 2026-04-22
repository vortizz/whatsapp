import { BadRequestException, Injectable } from '@nestjs/common'
import { Chat } from './entities/chat.schema'
import * as mongoose from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { User } from 'src/user/entities/user.schema'
import { Status } from 'src/message/entities/status.enum'
import { ChatEvent } from './entities/chat-event.schema'
import { WsClientManager } from 'src/websocket/ws-client-manager.service'
import { EncryptedKeyDto } from './dtos/create-group-chat.dto'

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: mongoose.Model<Chat>,
    @InjectModel(ChatEvent.name) private chatEventModel: mongoose.Model<ChatEvent>,
    private readonly wsClientManager: WsClientManager,
  ) {}

  async create(users: User[], encryptedKeys: EncryptedKeyDto[]): Promise<Chat> {
    const oldChat = await this.findByUsers(users)

    if (oldChat) {
      throw new BadRequestException('Chat already registered')
    }

    if (users[0]._id === users[1]._id) {
      throw new BadRequestException('Chat must have different users')
    }

    // CHECK IF THE ENCRYPTED KEYS ARE PROVIDED FOR BOTH USERS
    if (encryptedKeys.some((ek) => !users.some((u) => u._id === ek.userId))) {
      throw new BadRequestException('Encrypted keys must be provided for both users')
    }

    const newChat = new this.chatModel({ users, encryptedKeys })
    return await newChat.save()
  }

  async createGroup(users: User[], name: string, encryptedKeys: EncryptedKeyDto[]): Promise<Chat> {
    // CHECK IF THE ENCRYPTED KEYS ARE PROVIDED FOR ALL USERS
    if (encryptedKeys.some((ek) => !users.some((u) => u._id === ek.userId))) {
      throw new BadRequestException('Encrypted keys must be provided for all users')
    }

    const newChat = new this.chatModel({
      users,
      isGroup: true,
      name,
      createdBy: users[0],
      groupAdmins: [users[0]],
      encryptedKeys,
    })
    return await newChat.save()
  }

  async createChatEvent(chatEvent: ChatEvent, memberIds?: string[]): Promise<ChatEvent> {
    const newChatEvent = new this.chatEventModel(chatEvent)
    const saved = await newChatEvent.save()
    if (memberIds?.length) {
      const populated = <ChatEvent>await this.chatEventModel.findById(saved._id)
      this.wsClientManager.sendChatEventToClients(populated, memberIds)
    }
    return saved
  }

  async findEventsByChatId(chatId: string): Promise<ChatEvent[]> {
    return await this.chatEventModel.find({ chat: chatId }).sort({ createdAt: 1 })
  }

  async findByUser(user: User, username?: string): Promise<Chat[]> {
    const userId = new mongoose.Types.ObjectId(user._id)
    const trimmedUsername = username?.trim()
    const usernameRegex = trimmedUsername
      ? new RegExp(this.escapeRegex(trimmedUsername), 'i')
      : null

    return await this.chatModel.aggregate([
      { $match: { users: userId } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          as: 'usersData',
        },
      },
      ...(usernameRegex
        ? [
            {
              $match: {
                $or: [
                  {
                    usersData: {
                      $elemMatch: {
                        _id: { $ne: userId },
                        name: usernameRegex,
                      },
                    },
                  },
                  {
                    isGroup: true,
                    name: usernameRegex,
                  },
                ],
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
            {
              $group: {
                _id: null,
                totalMessagesCount: { $sum: 1 },
                visibleMessagesCount: {
                  $sum: {
                    $cond: [
                      {
                        $not: {
                          $in: [userId, { $ifNull: ['$deletedBy', []] }],
                        },
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: 'messageVisibility',
        },
      },
      {
        $addFields: {
          totalMessagesCount: {
            $ifNull: [{ $arrayElemAt: ['$messageVisibility.totalMessagesCount', 0] }, 0],
          },
          visibleMessagesCount: {
            $ifNull: [{ $arrayElemAt: ['$messageVisibility.visibleMessagesCount', 0] }, 0],
          },
        },
      },
      {
        $match: {
          $or: [{ totalMessagesCount: 0 }, { visibleMessagesCount: { $gt: 0 } }],
        },
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$chat', '$$chatId'] },
                    { $not: { $in: [userId, { $ifNull: ['$clearedBy', []] }] } },
                    { $not: { $in: [userId, { $ifNull: ['$deletedBy', []] }] } },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'lastMessageData',
        },
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id', isGroup: { $ifNull: ['$isGroup', false] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$chat', '$$chatId'] },
                    { $not: { $in: [userId, { $ifNull: ['$clearedBy', []] }] } },
                    { $not: { $in: [userId, { $ifNull: ['$deletedBy', []] }] } },
                    { $ne: ['$from', userId] },
                    {
                      $or: [
                        // 1:1 message: addressed to me and not yet read
                        {
                          $and: [
                            { $not: ['$$isGroup'] },
                            { $eq: ['$to', userId] },
                            { $in: ['$status', [Status.RECEIVED, Status.SENT]] },
                          ],
                        },
                        // Group message: I haven't read it yet
                        {
                          $and: [
                            '$$isGroup',
                            {
                              $not: {
                                $in: [
                                  userId,
                                  {
                                    $map: {
                                      input: { $ifNull: ['$readBy', []] },
                                      as: 'r',
                                      in: '$$r.user',
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'unreadMessagesData',
        },
      },
      {
        $addFields: {
          users: {
            $map: {
              input: '$users',
              as: 'userIdInChat',
              in: {
                $first: {
                  $filter: {
                    input: '$usersData',
                    as: 'userDoc',
                    cond: { $eq: ['$$userDoc._id', '$$userIdInChat'] },
                  },
                },
              },
            },
          },
          lastMessage: { $arrayElemAt: ['$lastMessageData', 0] },
          countUnreadMessages: {
            $ifNull: [{ $arrayElemAt: ['$unreadMessagesData.count', 0] }, 0],
          },
        },
      },
      {
        $project: {
          usersData: 0,
          messageVisibility: 0,
          totalMessagesCount: 0,
          visibleMessagesCount: 0,
          lastMessageData: 0,
          unreadMessagesData: 0,
        },
      },
      { $sort: { 'lastMessage.createdAt': -1, updatedAt: -1 } },
    ])
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  async findByUserSimple(user: User): Promise<Chat[]> {
    return await this.chatModel.find({ users: user })
  }

  async findGroupChatsByUser(userId: string): Promise<Chat[]> {
    return await this.chatModel.find({ users: userId, isGroup: true })
  }

  async findByUsers(users: User[]): Promise<Chat> {
    return await this.chatModel.findOne({ users: users })
  }

  async findById(_id: string): Promise<Chat> {
    return await this.chatModel.findById(_id)
  }

  async updateGroupName(_id: string, name: string, user: User): Promise<Chat> {
    const chatFound = await this.findById(_id)

    if (!chatFound) {
      throw new BadRequestException('Chat not found')
    }

    if (!chatFound.groupAdmins?.some((u) => u._id?.toString() === user._id)) {
      throw new BadRequestException('User must be admin to update the group name')
    }

    const newEvent = new ChatEvent()
    const chat = new Chat()
    chat._id = _id
    newEvent.chat = chat
    newEvent.isNameChanged = true
    newEvent.newName = name
    newEvent.doneBy = user
    const memberIds = chatFound.users.map((u) => u._id.toString())
    await this.createChatEvent(newEvent, memberIds)
    return await this.chatModel.findByIdAndUpdate(_id, { name }, { new: true })
  }

  async updateGroupDescription(_id: string, description: string, user: User): Promise<Chat> {
    const chatFound = await this.findById(_id)

    if (!chatFound) {
      throw new BadRequestException('Chat not found')
    }

    if (!chatFound.groupAdmins?.some((u) => u._id?.toString() === user._id)) {
      throw new BadRequestException('User must be admin to update the group description')
    }

    const newEvent = new ChatEvent()
    const chat = new Chat()
    chat._id = _id
    newEvent.chat = chat
    newEvent.isDescriptionChanged = true
    newEvent.doneBy = user
    const memberIds = chatFound.users.map((u) => u._id.toString())
    await this.createChatEvent(newEvent, memberIds)
    return await this.chatModel.findByIdAndUpdate(_id, { description }, { new: true })
  }

  async addGroupMembers(_id: string, userIds: string[], user: User): Promise<Chat> {
    const chatFound = await this.findById(_id)

    if (!chatFound) {
      throw new BadRequestException('Chat not found')
    }

    if (chatFound.users.some((u) => userIds.some((ui) => ui === u._id?.toString()))) {
      throw new BadRequestException('User does belong to the chat')
    }

    if (!chatFound.groupAdmins?.some((u) => u._id?.toString() === user._id)) {
      throw new BadRequestException('User must be admin to add members')
    }

    const newUsers = userIds.map((id) => {
      const u = new User()
      u._id = id
      return u
    })

    const newEvents = newUsers.map((nu) => {
      const newEvent = new ChatEvent()
      const chat = new Chat()
      chat._id = _id
      newEvent.chat = chat
      newEvent.doneBy = user
      newEvent.isUserAdded = true
      newEvent.userAdded = nu
      return newEvent
    })

    const allMemberIds = [...chatFound.users.map((u) => u._id.toString()), ...userIds]
    await Promise.all(newEvents.map((ne) => this.createChatEvent(ne, allMemberIds)))

    return await this.chatModel.findByIdAndUpdate(
      _id,
      { $addToSet: { users: { $each: newUsers } } },
      { new: true },
    )
  }

  async removeGroupMember(_id: string, userId: string, user: User): Promise<Chat> {
    const chatFound = await this.findById(_id)

    if (!chatFound) {
      throw new BadRequestException('Chat not found')
    }

    if (!chatFound.users.some((u) => u._id?.toString() === userId)) {
      throw new BadRequestException('User does not belong to the chat')
    }

    if (!chatFound.groupAdmins?.some((u) => u._id?.toString() === user._id)) {
      throw new BadRequestException('User must be admin to remove members')
    }

    if (chatFound.groupAdmins?.some((u) => u._id?.toString() === userId)) {
      await this.setUserGroupAdmin(_id, userId, false, user)
    }

    const removedUser = new User()
    removedUser._id = userId

    const chat = new Chat()
    chat._id = _id

    const newEvent = new ChatEvent()
    newEvent.chat = chat
    newEvent.doneBy = user
    newEvent.isUserRemoved = true
    newEvent.userRemoved = removedUser

    const memberIds = chatFound.users.map((u) => u._id.toString())
    await this.createChatEvent(newEvent, memberIds)

    return await this.chatModel.findByIdAndUpdate(
      _id,
      { $pull: { users: removedUser } },
      { new: true },
    )
  }

  async exitGroup(_id: string, user: User): Promise<Chat> {
    const chatFound = await this.findById(_id)

    if (!chatFound) {
      throw new BadRequestException('Chat not found')
    }

    if (!chatFound.users.some((u) => u._id?.toString() === user._id)) {
      throw new BadRequestException('User does not belong to the chat')
    }

    if (chatFound.groupAdmins?.some((u) => u._id?.toString() === user._id)) {
      await this.setUserGroupAdmin(_id, user._id, false, user)
    }

    const exitUser = new User()
    exitUser._id = user._id

    const chat = new Chat()
    chat._id = _id

    const newEvent = new ChatEvent()
    newEvent.chat = chat
    newEvent.doneBy = user
    newEvent.isUserRemoved = true
    newEvent.userRemoved = exitUser

    const memberIds = chatFound.users.map((u) => u._id.toString())
    await this.createChatEvent(newEvent, memberIds)

    return await this.chatModel.findByIdAndUpdate(
      _id,
      { $pull: { users: exitUser } },
      { new: true },
    )
  }

  async setUserGroupAdmin(
    _id: string,
    userId: string,
    isAdmin: boolean,
    user: User,
  ): Promise<Chat> {
    const chatFound = await this.findById(_id)

    if (!chatFound) {
      throw new BadRequestException('Chat not found')
    }

    if (!chatFound.users.some((u) => u._id?.toString() === userId)) {
      throw new BadRequestException('User does not belong to the chat')
    }

    if (!chatFound.groupAdmins?.some((u) => u._id?.toString() === user._id)) {
      throw new BadRequestException('User must be admin to set group admins')
    }

    if (isAdmin && chatFound.groupAdmins?.some((u) => u._id?.toString() === userId)) {
      throw new BadRequestException('User is already a group admin')
    }

    if (!isAdmin && !chatFound.groupAdmins?.some((u) => u._id?.toString() === userId)) {
      throw new BadRequestException('User is already not a group admin')
    }

    const updatedUser = new User()
    updatedUser._id = userId

    const update = isAdmin
      ? { $addToSet: { groupAdmins: updatedUser } }
      : { $pull: { groupAdmins: updatedUser } }

    return await this.chatModel.findByIdAndUpdate(_id, update, { new: true })
  }
}
