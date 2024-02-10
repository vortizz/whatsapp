import { Field, ObjectType } from "@nestjs/graphql"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from "mongoose"

export type UserDocument = mongoose.HydratedDocument<User>

@ObjectType()
@Schema({ timestamps: true, versionKey: false })
export class User {
    @Field(() => String)
    _id: mongoose.Schema.Types.ObjectId

    @Field(() => String)
    @Prop({
        type: String,
        required: true,
        trim: true
    })
    name: string

    @Field(() => String)
    @Prop({
        type: String,
        required: true,
        unique: true,
        trim: true
    })
    email: string

    @Field(() => String, { nullable: true })
    @Prop({
        type: String
    })
    password?: string

    @Field(() => String, { nullable: true })
    @Prop({
        type: String
    })
    token?: string;

    @Field(() => Date)
    createdAt: Date

    @Field(() => Date)
    updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)