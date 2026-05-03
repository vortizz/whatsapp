import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator'

import { Type } from 'class-transformer'

class RecoveryDto {
  @IsString()
  @IsNotEmpty()
  encryptedPrivateKey: string

  @IsString()
  @IsNotEmpty()
  iv: string
}

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

  @IsNotEmpty()
  @IsString()
  readonly publicKey: string

  @IsNotEmpty()
  @IsString()
  readonly encryptedPrivateKey: string

  @IsNotEmpty()
  @IsString()
  readonly iv: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecoveryDto)
  readonly recoveryCodes: RecoveryDto[]
}
