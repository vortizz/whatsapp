import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class GroupKeyEntryDto {
  @IsNotEmpty()
  @IsString()
  userId: string

  @IsNotEmpty()
  @IsString()
  encryptedKey: string

  @IsNotEmpty()
  @IsString()
  iv: string

  @IsNotEmpty()
  @IsString()
  ephemeralPublicKey: string
}

export class SetGroupKeysDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupKeyEntryDto)
  keys: GroupKeyEntryDto[]
}
