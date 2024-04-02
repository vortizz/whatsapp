import { Injectable, Logger } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { Message } from "src/message/entities/message.schema";

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
        private readonly userService: UserService
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
        // await this.messageService.updateStatusToReceived(client.userId)
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

        this.logger.debug('Remove ws connection: ' + client.userId)

        // SET DISCONNECTED USER
        await this.userService.updateIsConnected(client.userId, false)
        this.connectedClients.delete(client.userId)
    }

    // async sendMessageToClient(wsAuthUserId: string, sendMessageDto: SendMessageDto) {
    //     const connectedClient = this.connectedClients.get(sendMessageDto.to)
    //     const ownConnectedClient = this.connectedClients.get(wsAuthUserId)

    //     if (!ownConnectedClient) {
    //         return
    //     }

    //     // SAVE INTO THE DATABASE
    //     const from = new User()
    //     from._id = wsAuthUserId
    //     const status = connectedClient ? Status.RECEIVED : Status.SENT
    //     const message = await this.messageService.create(from, sendMessageDto, status)
    //     if (connectedClient) {
    //         connectedClient.send(JSON.stringify(message))
    //     }
    //     ownConnectedClient.send(JSON.stringify(message))
    // }

    sendMessageToClient(message: Message): void {
        const connectedClient = this.connectedClients.get(message.to._id.toString())
        const ownConnectedClient = this.connectedClients.get(message.from._id.toString())
    
        const data = { name: 'new-message', data: message }
        if (ownConnectedClient) {
            ownConnectedClient.send(JSON.stringify(data))
        }

        if (connectedClient) {
            connectedClient.send(JSON.stringify(data))
        }
    }

    sendStatusReceivedToClient(data: { chat: string, from: string, messages: any[] }[]): void {
        data.forEach(item => {
            const connectedClient = this.connectedClients.get(item.from.toString())
            
            if (connectedClient) {
                connectedClient.send(JSON.stringify({ name: 'received-message', data: item }))
            }
        })
    }

    sendStatusReadToClient(data: { chat: string, from: string, messages: any[] }[]): void {
        data.forEach(item => {
            const connectedClient = this.connectedClients.get(item.from.toString())
            
            if (connectedClient) {
                connectedClient.send(JSON.stringify({ name: 'read-message', data: item }))
            }
        })
    }

    isClientConnected(userId: string): boolean {
        return !!this.connectedClients.get(userId)
    }
}