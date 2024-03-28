import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Message } from "./entities/message.schema";
import { Auth } from "src/common/decorator/auth.decorator";
import { CreateMessageDto } from "./dtos/create-message.dto";
import { AuthUser } from "src/common/decorator/user.decorator";
import { User } from "src/user/entities/user.schema";
import { MessageService } from "./message.service";

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}
    
    @Auth()
    @Post()
    async create(
        @AuthUser() user: User,
        @Body() createMessageDto: CreateMessageDto
    ): Promise<Message> {
        return await this.messageService.create(user, createMessageDto)
    }

    @Auth()
    @Get('/:chat_id')
    async findByChat(
        @Param('chat_id') chatId: string
    ): Promise<Message[]> {
        return await this.messageService.findByChat(chatId)
    }
}