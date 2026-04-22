import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class EncryptedKeyDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string

  @IsNotEmpty()
  encryptedKey: string
}

export class CreateGroupChatDto {
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  user_ids: string[]

  @IsString()
  @IsNotEmpty()
  name: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EncryptedKeyDto)
  @ArrayMinSize(2)
  encryptedKeys: EncryptedKeyDto[]
}
