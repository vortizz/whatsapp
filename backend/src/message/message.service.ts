import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Message } from "./entities/message.schema";
import { User } from "src/user/entities/user.schema";
import { CreateMessageDto } from "./dtos/create-message.dto";
import { InjectModel } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Chat } from "src/chat/entities/chat.schema";
import { ChatService } from "src/chat/chat.service";
import { UserService } from "src/user/user.service";

@Injectable()
export class MessageService {
    constructor(
        @InjectModel(Message.name) private messageModel: mongoose.Model<Message>,
        private readonly chatService: ChatService,
        private readonly userService: UserService,
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
            from: user
        })
        return await newMessage.save()
    }

    async findByChat(chat: string): Promise<Message[]> {
        return await this.messageModel.find({ chat }).sort({ createdAt: 1 })
    }
}