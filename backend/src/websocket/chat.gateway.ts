import { Injectable } from "@nestjs/common";
import { EntrypointGateway } from "./entrypoint.gateway";
import { MessageBody, SubscribeMessage } from "@nestjs/websockets";
import { TypingDto } from "./dtos/typing.dto";
import { WsClientManager } from "./ws-client-manager.service";
import { WsAuthUserId } from "src/common/decorator/ws-user-id.decorator";

@Injectable()
export class ChatGateway extends EntrypointGateway {
    constructor(private readonly wsClientManager: WsClientManager) {
        super();
    }

    @SubscribeMessage('typing')
    typing(
        @WsAuthUserId() wsAuthUserId: string,
        @MessageBody() typingDto: TypingDto
    ) {
        this.wsClientManager.sendTypingToClients(wsAuthUserId, typingDto.chatId)
    }
}
