import { Field, InputType } from '@nestjs/graphql'
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

@InputType()
export class CreateUserInput {
    @Field(() => String)
    @IsNotEmpty()
    @IsString()
    name: string

    @Field(() => String)
    @IsNotEmpty()
    @IsEmail()
    email: string

    @Field(() => String)
    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    password: string
}