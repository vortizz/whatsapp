import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'

export type UserDocument = mongoose.HydratedDocument<User>

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  _id: string

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name: string

  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  email: string

  @Prop({
    type: String,
    trim: true,
    default: 'Hey there! I am using WhatsApp.',
    required: true,
  })
  about: string

  @Prop({
    type: String,
    select: false,
  })
  password?: string

  @Prop({
    type: String,
    select: false,
  })
  token?: string

  @Prop({
    type: Boolean,
    default: false,
  })
  isConnected: boolean

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        autopopulate: true,
      },
    ],
    default: [],
  })
  blockedUsers: User[]

  @Prop({ type: Date, default: () => Date.now() })
  lastSeenAt: Date

  @Prop({ type: String })
  publicKey?: string

  @Prop({ type: String, select: false })
  encryptedPrivateKey?: string

  @Prop({ type: String, select: false })
  iv?: string

  @Prop({
    type: [
      {
        encryptedPrivateKey: String,
        iv: String,
      },
    ],
    select: false,
  })
  recoveryCodes?: {
    encryptedPrivateKey: string
    iv: string
  }[]

  createdAt: Date
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
