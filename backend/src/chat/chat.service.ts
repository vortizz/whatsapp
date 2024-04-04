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
        // GET CHATS BY FILTERED USER
        let chats = await this.chatModel.find({ users: user })
        
        if (username) {
            chats = chats.filter(chat => 
                chat.users.some(user => 
                    user.name.toLowerCase().trim().includes(
                        username.toLowerCase().trim()
                    )
                )
            )
        }
    
        if (!chats.length) {
            return []
        }
        
        // GET LAST MESSAGE SENT
        const lastMessagesChatPromise = this.chatModel.aggregate([
            { $match: { _id: { $in: chats.map(chat => chat._id) } } },
            { $lookup: {
                from: 'messages',
                localField: '_id',
                foreignField: 'chat',
                as: 'messages'
            } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', lastMessage: { $first: '$messages' }} },
        ])

        // COUNT UNREAD MESSAGES 
        const countUnreadMessagesPromise = this.chatModel.aggregate([
            { $match: { _id: { $in: chats.map(chat => chat._id) } } },
            { $lookup: {
                from: 'messages',
                localField: '_id',
                foreignField: 'chat',
                as: 'messages'
            } },
            { $unwind: '$messages' },
            { $match: { $and: [ 
                { $or: [
                    { 'messages.status': Status.RECEIVED },
                    { 'messages.status': Status.SENT }
                ] },
                { 'messages.to': new mongoose.Types.ObjectId(user._id) }
            ] } },
            { $group: { _id: '$_id', count: { $sum: 1 } } }
        ])

        const [lastMessagesChat, countUnreadMessages] = await Promise.all([lastMessagesChatPromise, countUnreadMessagesPromise])

        // MERGE CHAT DATA WITH USERS DATA
        return chats.map(chat => {
            const lastMessage = lastMessagesChat.find(lastMsg => lastMsg._id.toString() === chat._id.toString())
            const unreadMessages = countUnreadMessages.find(item => item._id.toString() === chat._id.toString())
            return {
                ...JSON.parse(JSON.stringify(chat)),
                ...lastMessage,
                countUnreadMessages: unreadMessages?.count || 0
            }
        }).sort((a, b) => {
            if (a.lastMessage?.createdAt > b.lastMessage?.createdAt) {
                return -1
            }
            if (a.lastMessage?.createdAt < b.lastMessage?.createdAt) {
                return 1
            }
            return 0
        })
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