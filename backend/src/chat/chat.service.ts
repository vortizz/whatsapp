import { BadRequestException, Injectable } from "@nestjs/common";
import { Chat } from "./entities/chat.schema";
import * as mongoose from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/user/entities/user.schema";
import { Status } from "src/message/entities/status.enum";

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel: mongoose.Model<Chat>
    ) {}

    async create(users: User[]): Promise<Chat> {
        const oldChat = await this.findByUsers(users)

        if (oldChat) {
            throw new BadRequestException('Chat already registered')
        }

        if (users[0]._id === users[1]._id) {
            throw new BadRequestException('Chat must have different users')
        }

        const newChat = new this.chatModel({ users })
        return await newChat.save()
    }

    async findByUser(user: User, username?: string): Promise<Chat[]> {
        const userId = new mongoose.Types.ObjectId(user._id)
        const trimmedUsername = username?.trim()
        const usernameRegex = trimmedUsername ? new RegExp(this.escapeRegex(trimmedUsername), 'i') : null

        return await this.chatModel.aggregate([
            { $match: { users: userId } },
            { $lookup: {
                from: 'users',
                localField: 'users',
                foreignField: '_id',
                as: 'usersData'
            } },
            ...(usernameRegex ? [{
                $match: {
                    usersData: {
                        $elemMatch: {
                            _id: { $ne: userId },
                            name: usernameRegex
                        }
                    }
                }
            }] : []),
            { $lookup: {
                from: 'messages',
                let: { chatId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
                    { $group: {
                        _id: null,
                        totalMessagesCount: { $sum: 1 },
                        visibleMessagesCount: {
                            $sum: {
                                $cond: [
                                    {
                                        $not: {
                                            $in: [userId, { $ifNull: ['$deletedBy', []] }]
                                        }
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    } }
                ],
                as: 'messageVisibility'
            } },
            { $addFields: {
                totalMessagesCount: {
                    $ifNull: [{ $arrayElemAt: ['$messageVisibility.totalMessagesCount', 0] }, 0]
                },
                visibleMessagesCount: {
                    $ifNull: [{ $arrayElemAt: ['$messageVisibility.visibleMessagesCount', 0] }, 0]
                }
            } },
            { $match: {
                $or: [
                    { totalMessagesCount: 0 },
                    { visibleMessagesCount: { $gt: 0 } }
                ]
            } },
            { $lookup: {
                from: 'messages',
                let: { chatId: '$_id' },
                pipeline: [
                    { $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$chat', '$$chatId'] },
                                { $not: { $in: [userId, { $ifNull: ['$clearedBy', []] }] } },
                                { $not: { $in: [userId, { $ifNull: ['$deletedBy', []] }] } }
                            ]
                        }
                    } },
                    { $sort: { createdAt: -1 } },
                    { $limit: 1 }
                ],
                as: 'lastMessageData'
            } },
            { $lookup: {
                from: 'messages',
                let: { chatId: '$_id' },
                pipeline: [
                    { $match: {
                        $expr: {
                            $and: [
                                { $eq: ['$chat', '$$chatId'] },
                                { $not: { $in: [userId, { $ifNull: ['$clearedBy', []] }] } },
                                { $not: { $in: [userId, { $ifNull: ['$deletedBy', []] }] } },
                                { $in: ['$status', [Status.RECEIVED, Status.SENT]] },
                                { $eq: ['$to', userId] }
                            ]
                        }
                    } },
                    { $count: 'count' }
                ],
                as: 'unreadMessagesData'
            } },
            { $addFields: {
                users: {
                    $map: {
                        input: '$users',
                        as: 'userIdInChat',
                        in: {
                            $first: {
                                $filter: {
                                    input: '$usersData',
                                    as: 'userDoc',
                                    cond: { $eq: ['$$userDoc._id', '$$userIdInChat'] }
                                }
                            }
                        }
                    }
                },
                lastMessage: { $arrayElemAt: ['$lastMessageData', 0] },
                countUnreadMessages: {
                    $ifNull: [{ $arrayElemAt: ['$unreadMessagesData.count', 0] }, 0]
                }
            } },
            { $project: {
                usersData: 0,
                messageVisibility: 0,
                totalMessagesCount: 0,
                visibleMessagesCount: 0,
                lastMessageData: 0,
                unreadMessagesData: 0
            } },
            { $sort: { 'lastMessage.createdAt': -1, updatedAt: -1 } }
        ])
    }

    private escapeRegex(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    async findByUserSimple(user: User): Promise<Chat[]> {
        return await this.chatModel.find({ users: user }) 
    }

    async findByUsers(users: User[]): Promise<Chat> {
        return await this.chatModel.findOne({ users: users })
    }

    async findById(_id: string): Promise<Chat> {
        return await this.chatModel.findById(_id)
    }
}
