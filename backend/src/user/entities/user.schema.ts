import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'

export type UserDocument = mongoose.HydratedDocument<User>

@Schema({ timestamps: true, versionKey: false })
export class User {
    _id: string

    @Prop({
        type: String,
        required: true,
        trim: true
    })
    name: string

    @Prop({
        type: String,
        required: true,
        unique: true,
        trim: true
    })
    email: string

    @Prop({
        type: String,
        trim: true,
        default: 'Hey there! I am using WhatsApp.',
        required: true
    })
    about: string

    @Prop({
        type: String
    })
    password?: string

    @Prop({
        type: String
    })
    token?: string

    @Prop({
        type: Boolean,
        default: false
    })
    isConnected: Boolean

    createdAt: Date
    updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)