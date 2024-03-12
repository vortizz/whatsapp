import { IsEmail, IsMongoId, IsOptional, IsString, IsStrongPassword, MaxLength } from 'class-validator'

export class UpdateUserDto {
    @IsMongoId()
    _id: string

    @IsOptional()
    @IsString()
    @MaxLength(25)
    name?: string

    @IsOptional()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsString()
    @MaxLength(150)
    about?: string

    @IsOptional()
    @IsString()
    // @IsStrongPassword({
    //     minLength: 6,
    //     minLowercase: 1,
    //     minNumbers: 1,
    //     minSymbols: 1,
    //     minUppercase: 1
    // })
    password?: string
}