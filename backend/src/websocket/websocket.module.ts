import { Module } from "@nestjs/common";
import { WsClientManager } from "./ws-client-manager.service";
import { EntrypointGateway } from "./entrypoint.gateway";
import { LifecycleGateway } from "./lifecycle.gateway";
import { ChatGateway } from "./chat.gateway";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        JwtModule,
    ],
    providers: [
        WsClientManager,
        EntrypointGateway,
        LifecycleGateway,
        ChatGateway,
    ],
    exports: [WsClientManager]
})
export class WebsocketModule {}
