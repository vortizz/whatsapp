import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { User } from 'src/user/entities/user.schema'

export type ChatDocument = mongoose.HydratedDocument<Chat>

@Schema({ timestamps: true, versionKey: false })
export class Chat {
  _id: string

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        autopopulate: true,
      },
    ],
    required: true,
  })
  users: User[]

  @Prop({ type: Boolean, default: false })
  isGroup?: boolean

  @Prop({ type: String, trim: true })
  name?: string

  @Prop({ type: String, trim: true })
  description?: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  createdBy?: User

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        autopopulate: true,
      },
    ],
  })
  groupAdmins?: User[]

  @Prop({
    type: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true },
        encryptedKey: { type: String, required: true },
      },
    ],
    default: [],
  })
  encryptedKeys?: {
    userId: User
    encryptedKey: string
  }[]

  createdAt: Date
  updatedAt: Date
}

export const ChatSchema = SchemaFactory.createForClass(Chat)
