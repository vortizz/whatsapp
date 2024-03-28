import { Injectable, Logger } from "@nestjs/common";
import { EntrypointGateway } from "./entrypoint.gateway";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { DecodedAuthToken, WsClientManager } from "./ws-client-manager.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LifecycleGateway
    extends EntrypointGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(LifecycleGateway.name);
    
    constructor(
        private configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly wsClientManager: WsClientManager
    ) {
        super()
    }
    
    afterInit(server: any) {
        this.logger.debug('Websockets initialized: ' + LifecycleGateway.name)
    }

    handleConnection(client: any, ...args: any[]) {
        const decodedAuthToken = this.getDecodedAuthToken(client)

        if (!decodedAuthToken) {
            client.close()
            return
        }

        this.wsClientManager.addConnection(client, decodedAuthToken)
    }

    handleDisconnect(client: any) {
        this.wsClientManager.removeConnection(client)
    }

    getDecodedAuthToken(client: any): DecodedAuthToken {
        let decodedJwt: DecodedAuthToken = null

        try {
            if (client.protocol) {
                decodedJwt = this.jwtService.verify(client.protocol, {
                    secret: this.configService.get<string>('app.jwtSecretKey')
                })
            }
        } catch (error) {}

        return decodedJwt
    }
    
}