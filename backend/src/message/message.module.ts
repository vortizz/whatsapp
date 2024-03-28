import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./entities/message.schema";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { UserModule } from "src/user/user.module";
import { ChatModule } from "src/chat/chat.module";

@Module({
    imports: [
        MongooseModule.forFeatureAsync([{ 
            name: Message.name, 
            useFactory: () => {
                const schema = MessageSchema
                schema.plugin(require('mongoose-autopopulate'))
                return schema
            },
        }]),
        UserModule,
        ChatModule
    ],
    controllers: [MessageController],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessageModule {}