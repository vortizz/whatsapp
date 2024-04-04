import { Module, forwardRef } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Chat, ChatSchema } from "./entities/chat.schema";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [
        MongooseModule.forFeatureAsync([{ 
            name: Chat.name, 
            useFactory: () => {
                const schema = ChatSchema
                schema.plugin(require('mongoose-autopopulate'))
                return schema
            }
        }]),
        forwardRef(() => UserModule)
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService]
})
export class ChatModule {}