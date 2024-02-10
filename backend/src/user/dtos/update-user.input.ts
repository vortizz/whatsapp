import { Field, InputType } from "@nestjs/graphql"
import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator"
import * as mongoose from "mongoose"

@InputType()
export class UpdateUserInput {
    @Field(() => String)
    @IsMongoId()
    _id: mongoose.Schema.Types.ObjectId

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    name?: string

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsEmail()
    email?: string

    @Field(() => String, { nullable: true })
    @IsOptional()
    @IsString()
    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    password?: string
}