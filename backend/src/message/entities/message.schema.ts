import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { Chat } from 'src/chat/entities/chat.schema'
import { User } from 'src/user/entities/user.schema'
import { Status } from './status.enum'

export type MessageDocument = mongoose.HydratedDocument<Message>

@Schema({ timestamps: true, versionKey: false })
export class Message {
  _id: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Chat.name,
    autopopulate: true,
    required: true,
  })
  chat: Chat

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  text: string

  @Prop({ type: String, required: false })
  iv?: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    autopopulate: true,
    required: true,
  })
  from: User

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    autopopulate: true,
    required: false,
  })
  to?: User

  @Prop({
    type: String,
    enum: Status,
  })
  status?: Status

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    autopopulate: { maxDepth: 2 },
  })
  replyTo?: Message

  @Prop({ type: Boolean })
  forwarded?: boolean

  @Prop({ type: Date })
  receivedAt?: Date

  @Prop({ type: Date })
  readAt?: Date

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
        at: { type: Date },
      },
    ],
    default: [],
  })
  receivedBy?: { user: mongoose.Types.ObjectId; at: Date }[]

  @Prop({
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: User.name },
        at: { type: Date },
      },
    ],
    default: [],
  })
  readBy?: { user: mongoose.Types.ObjectId; at: Date }[]

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        autopopulate: true,
      },
    ],
  })
  clearedBy?: User[]

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        autopopulate: true,
      },
    ],
  })
  deletedBy?: User[]

  createdAt: Date
  updatedAt: Date
}

export const MessageSchema = SchemaFactory.createForClass(Message)
