import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from "mongoose"
import { Chat } from "src/chat/entities/chat.schema"
import { User } from "src/user/entities/user.schema"
import { Status } from "./status.enum"

export type MessageDocument = mongoose.HydratedDocument<Message>

@Schema({ timestamps: true, versionKey: false })
export class Message {
    _id: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Chat.name,
        autopopulate: true,
        required: true
    })
    chat: Chat

    @Prop({
        type: String,
        required: true,
        trim: true
    })
    text: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        autopopulate: true,
        required: true
    })
    from: User

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        autopopulate: true,
        required: true
    })
    to: User

    @Prop({
        type: String,
        enum: Status
    })
    status?: Status

    createdAt: Date
    updatedAt: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message)