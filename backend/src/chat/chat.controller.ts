import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Chat } from "./entities/chat.schema";
import { Auth } from "src/common/decorator/auth.decorator";
import { AuthUser } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.schema";
import { CreateChatDto } from "./dtos/create-chat.dto";

@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Auth()
    @Get()
    async findByUser(
        @AuthUser() user: User, 
        @Query('username') username: string
    ): Promise<Chat[]> {
        return await this.chatService.findByUser(user, username)
    }

    @Auth()
    @Post()
    async create(@AuthUser() user: User, @Body() createChatDto: CreateChatDto): Promise<Chat> {
        const userWith = new User()
        userWith._id = createChatDto.user_id
        return await this.chatService.create([user, userWith])
    }
}