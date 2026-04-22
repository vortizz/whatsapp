import {
  IsMongoId,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator'
import { Type } from 'class-transformer'

class EncryptedKeyDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string

  @IsNotEmpty()
  encryptedKey: string
}

export class CreateChatDto {
  @IsNotEmpty()
  @IsMongoId()
  user_id: string

  @IsArray({ minItems: 1 })
  @ValidateNested({ each: true })
  @Type(() => EncryptedKeyDto)
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  encryptedKeys: EncryptedKeyDto[]
}
