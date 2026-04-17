import { Injectable, Logger } from '@nestjs/common'
import { EntrypointGateway } from './entrypoint.gateway'
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets'
import { JwtService } from '@nestjs/jwt'
import { DecodedAuthToken, WsClientManager } from './ws-client-manager.service'
import { ConfigService } from '@nestjs/config'
import { ModuleRef } from '@nestjs/core'
import { MessageService } from 'src/message/message.service'

@Injectable()
export class LifecycleGateway
  extends EntrypointGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(LifecycleGateway.name)

  constructor(
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly wsClientManager: WsClientManager,
    private readonly moduleRef: ModuleRef,
  ) {
    super()
  }

  private get messageService(): MessageService {
    return this.moduleRef.get(MessageService, { strict: false })
  }

  afterInit(server: any) {
    this.logger.debug('Websockets initialized: ' + LifecycleGateway.name)
  }

  async handleConnection(client: any, ...args: any[]) {
    const decodedAuthToken = this.getDecodedAuthToken(client)

    if (!decodedAuthToken) {
      client.close()
      return
    }

    await this.wsClientManager.addConnection(client, decodedAuthToken)
    await this.messageService.updateStatusToReceived({ _id: decodedAuthToken.id } as any)
  }

  handleDisconnect(client: any) {
    this.wsClientManager.removeConnection(client)
  }

  getDecodedAuthToken(client: any): DecodedAuthToken {
    let decodedJwt: DecodedAuthToken = null

    try {
      if (client.protocol) {
        decodedJwt = this.jwtService.verify(client.protocol, {
          secret: this.configService.get<string>('app.jwtSecretKey'),
        })
      }
    } catch (error) {}

    return decodedJwt
  }
}
