import { Module, forwardRef } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Chat, ChatSchema } from "./entities/chat.schema";
import { UserModule } from "src/user/user.module";
import { ChatEvent, ChatEventSchema } from "./entities/chat-event.schema";
import { WebsocketModule } from "src/websocket/websocket.module";

@Module({
    imports: [
        MongooseModule.forFeatureAsync([
            {
                name: Chat.name,
                useFactory: () => {
                    const schema = ChatSchema
                    schema.plugin(require('mongoose-autopopulate'))
                    return schema
                }
            },
            {
                name: ChatEvent.name,
                useFactory: () => {
                    const schema = ChatEventSchema
                    schema.plugin(require('mongoose-autopopulate'))
                    return schema
                }
            },
        ]),
        forwardRef(() => UserModule),
        WebsocketModule,
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService]
})
export class ChatModule {}