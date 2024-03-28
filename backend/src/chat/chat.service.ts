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
        return await this.chatModel.find({ users: user })
    }

    async findByUsers(users: User[]): Promise<Chat> {
        return await this.chatModel.findOne({ users: users })
    }

    async findById(_id: string): Promise<Chat> {
        return await this.chatModel.findById(_id)
    }
}