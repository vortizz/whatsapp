import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Message } from "./entities/message.schema";
import { User } from "src/user/entities/user.schema";
import { CreateMessageDto } from "./dtos/create-message.dto";
import { InjectModel } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { ChatService } from "src/chat/chat.service";
import { UserService } from "src/user/user.service";
import { Status } from "./entities/status.enum";
import { WsClientManager } from "src/websocket/ws-client-manager.service";

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private messageModel: mongoose.Model<Message>,
        private readonly chatService: ChatService,
        private readonly userService: UserService,
        private readonly wsClientManager: WsClientManager
    ) {}

    async create(user: User, createMessageDto: CreateMessageDto): Promise<Message> {
        const chat = await this.chatService.findById(createMessageDto.chat)

        if (!chat) {
            throw new NotFoundException('Chat not found')
        }

        if (!chat.users.some(user => user._id.toString() === createMessageDto.to)) {
            throw new BadRequestException('Receiver does not belong to the chat')
        }

        const to = await this.userService.findById(createMessageDto.to)

        if (!to) {
            throw new NotFoundException('User not found')
        }

        if (to._id.toString() === user._id) {
            throw new BadRequestException('Recipient must be different from the receiver')
        }

        const newMessage = new this.messageModel({
            ...createMessageDto,
            from: user,
            status: this.wsClientManager.isClientConnected(createMessageDto.to) ? Status.RECEIVED : Status.SENT
        })
        const messageCreated = <Message>await newMessage.save()

        this.wsClientManager.sendMessageToClient(messageCreated)

        return messageCreated
    }

    async findByChat(chat: string): Promise<Message[]> {
        return await this.messageModel.find({ chat }).sort({ createdAt: 1 })
    }

    async updateStatusToReceived(user: User): Promise<void> {
        const messagesToBeUpdated = await this.messageModel.aggregate([
            { $match: { to: new mongoose.Types.ObjectId(user._id), status: Status.SENT } },
            { $group: {
                _id: { chat: '$chat', from: '$from' },
                messages: { $push: '$$ROOT' }
            } },
            { $project: { _id: 0, 'chat': '$_id.chat', 'from': '$_id.from', 'messages': '$messages' } }
        ])

        await this.messageModel.updateMany(
            { to: user._id, status: Status.SENT },
            { $set: { status: Status.RECEIVED } }
        )
        
        this.wsClientManager.sendStatusReceivedToClient(messagesToBeUpdated)
    }

    async updateStatusToRead(user: User, chat: string) {
        const messagesToBeUpdated = await this.messageModel.aggregate([
            { $match: {
                to: new mongoose.Types.ObjectId(user._id),
                chat: new mongoose.Types.ObjectId(chat),
                status: Status.RECEIVED
            } },
            { $group: {
                _id: { chat: '$chat', from: '$from' },
                messages: { $push: '$$ROOT' }
            } },
            { $project: { _id: 0, 'chat': '$_id.chat', 'from': '$_id.from', 'messages': '$messages' } }
        ])

        await this.messageModel.updateMany(
            { to: user._id, chat, status: Status.RECEIVED },
            { $set: { status: Status.READ } }
        )

        this.wsClientManager.sendStatusReadToClient(messagesToBeUpdated)
    }
}