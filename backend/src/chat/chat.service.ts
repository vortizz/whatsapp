import { BadRequestException, Injectable } from "@nestjs/common";
import { Chat } from "./entities/chat.schema";
import * as mongoose from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/user/entities/user.schema";

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

    async findByUser(user: User): Promise<Chat[]> {
        // GET CHATS BY FILTERED USER
        const chats = await this.chatModel.find({ users: user })

        if (!chats.length) {
            return []
        }
        
        // GET LAST MESSAGE SENT
        const lastMessagesChat = await this.chatModel.aggregate([
            { $match: { _id: { $in: chats.map(chat => chat._id) } } },
            { $lookup: {
                from: 'messages',
                localField: '_id',
                foreignField: 'chat',
                as: 'messages'
            } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', lastMessage: { $first: '$messages' }} } 
        ])

        // MERGE CHAT DATA WITH USERS DATA
        return chats.map(chat => {
            const lastMessage = lastMessagesChat.find(lastMsg => lastMsg._id.toString() === chat._id.toString())
            return {
                ...JSON.parse(JSON.stringify(chat)),
                ...lastMessage
            }
        }).sort((a, b) => {
            if (a.lastMessage.createdAt > b.lastMessage.createdAt) {
                return -1
            }
            if (a.lastMessage.createdAt < b.lastMessage.createdAt) {
                return 1
            }
            return 0
        })
    }

    async findByUsers(users: User[]): Promise<Chat> {
        return await this.chatModel.findOne({ users: users })
    }

    async findById(_id: string): Promise<Chat> {
        return await this.chatModel.findById(_id)
    }
}