import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { User } from "src/user/entities/user.schema";

export type ChatDocument = mongoose.HydratedDocument<Chat>

@Schema({ timestamps: true, versionKey: false })
export class Chat {
    _id: string

    @Prop({
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: User.name,
            autopopulate: true
        }],
        required: true
    })
    users: User[]

    createdAt: Date
    updatedAt: Date
}

export const ChatSchema = SchemaFactory.createForClass(Chat)
