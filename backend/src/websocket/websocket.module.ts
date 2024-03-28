import { Module } from "@nestjs/common";
import { WsClientManager } from "./ws-client-manager.service";
import { EntrypointGateway } from "./entrypoint.gateway";
import { LifecycleGateway } from "./lifecycle.gateway";
import { ChatGateway } from "./chat.gateway";
import { UserModule } from "src/user/user.module";
import { MessageModule } from "src/message/message.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        JwtModule,
        UserModule,
        MessageModule
    ],
    providers: [
        WsClientManager,
        EntrypointGateway,
        LifecycleGateway,
        ChatGateway,
    ]
})
export class WebsocketModule {}