import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator'

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string

    @IsNotEmpty()
    @IsEmail()
    readonly email: string

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    readonly password: string
}