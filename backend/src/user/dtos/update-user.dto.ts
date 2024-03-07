import { IsEmail, IsMongoId, IsOptional, IsString, IsStrongPassword } from 'class-validator'
import * as mongoose from 'mongoose'

export class UpdateUserDto {
    @IsMongoId()
    _id: string

    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsEmail()
    email?: string

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