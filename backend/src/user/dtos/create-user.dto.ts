import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MaxLength } from 'class-validator'

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    readonly name: string

    @IsNotEmpty()
    @IsEmail()
    readonly email: string

    @IsOptional()
    @IsString()
    @MaxLength(150)
    readonly about: string

    @IsNotEmpty()
    @IsString()
    // @IsStrongPassword({
    //     minLength: 6,
    //     minLowercase: 1,
    //     minNumbers: 1,
    //     minSymbols: 1,
    //     minUppercase: 1
    // })
    readonly password: string
}