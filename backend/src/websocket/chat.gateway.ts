import { Injectable, Logger } from "@nestjs/common";
import { EntrypointGateway } from "./entrypoint.gateway";
import { MessageBody, SubscribeMessage } from "@nestjs/websockets";
import { SendMessageDto } from "./dtos/send-message.dto";
import { WsClientManager } from "./ws-client-manager.service";
import { WsAuthUserId } from "src/common/decorator/ws-user-id.decorator";

@Injectable()
export class ChatGateway extends EntrypointGateway {
    private readonly logger = new Logger(ChatGateway.name)

    constructor(private readonly wsClientManager: WsClientManager) {
        super();
    }

    @SubscribeMessage('send_message')
    async sendMessage(
        @WsAuthUserId() wsAuthUserId: string,
        @MessageBody() sendMessageDto: SendMessageDto
    ) {
        this.logger.debug(`User ${wsAuthUserId} sent the message "${sendMessageDto.text}" to ${sendMessageDto.to} on chat ${sendMessageDto.chat}`)
        this.wsClientManager.sendMessageToClient(wsAuthUserId, sendMessageDto)
    }
}