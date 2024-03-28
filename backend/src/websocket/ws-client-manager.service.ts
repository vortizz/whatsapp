import { Injectable, Logger } from "@nestjs/common";
import { SendMessageDto } from "./dtos/send-message.dto";
import { UserService } from "src/user/user.service";
import { MessageService } from "src/message/message.service";
import { User } from "src/user/entities/user.schema";

export type DecodedAuthToken = {
    id: string
    email: string
    exp: number
    iat: number
}

@Injectable()
export class WsClientManager {
    private readonly logger = new Logger(WsClientManager.name)
    private readonly connectedClients = new Map<string, any>()

    constructor(
        private readonly userService: UserService,
        private readonly messageService: MessageService
    ) {}
    
    async addConnection(client: any, decodedAuthToken: DecodedAuthToken) {
        this.logger.debug('Add ws connection: ' + decodedAuthToken.id)

        client.userId = decodedAuthToken.id.slice()
        const connectedClient = this.connectedClients.get(decodedAuthToken.id)

        if (connectedClient) {
            connectedClient.close()
        }

        // SET CONNECTED USER
        await this.userService.updateIsConnected(client.userId, true)
        this.connectedClients.set(decodedAuthToken.id, client)

        setTimeout(() => {
            client.close()
        }, decodedAuthToken.exp * 1000 - Date.now());
    }

    async removeConnection(client: any) {
        const connectedClient = this.connectedClients.get(client.userId)

        if (!connectedClient) {
            return
        }

        this.logger.debug('Remove ws connection: ', client.userId)

        // SET DISCONNECTED USER
        await this.userService.updateIsConnected(client.userId, false)
        this.connectedClients.delete(client.userId)
    }

    async sendMessageToClient(wsAuthUserId: string, sendMessageDto: SendMessageDto) {
        const connectedClient = this.connectedClients.get(sendMessageDto.to)
        if (!connectedClient) {
            return
        }

        // SAVE INTO THE DATABASE
        const from = new User()
        from._id = wsAuthUserId
        const message = await this.messageService.create(from, sendMessageDto)
        connectedClient.send(JSON.stringify(message))
    }
}