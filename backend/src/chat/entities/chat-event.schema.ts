import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { User } from "src/user/entities/user.schema";
import { Chat } from "./chat.schema";

export type ChatEventDocument = mongoose.HydratedDocument<ChatEvent>

@Schema({ timestamps: true, versionKey: false })
export class ChatEvent {
    _id: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Chat.name,
        autopopulate: true,
        required: true
    })
    chat: Chat

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        autopopulate: true,
        required: true
    })
    doneBy: User

    @Prop({ type: Boolean })
    isNameChanged?: boolean

    @Prop({ type: String })
    newName?: string

    @Prop({ type: Boolean })
    isDescriptionChanged?: boolean

    @Prop({ type: Boolean })
    isUserAdded?: boolean

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, autopopulate: true })
    userAdded?: User

    @Prop({ type: Boolean })
    isUserRemoved?: boolean

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, autopopulate: true })
    userRemoved?: User

    createdAt: Date
    updatedAt: Date
}

export const ChatEventSchema = SchemaFactory.createForClass(ChatEvent)
