import { IsArray, IsMongoId, IsNotEmpty, ArrayMinSize, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class EncryptedKeyDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string

  @IsNotEmpty()
  encryptedKey: string
}

export class AddMemberGroupChatDto {
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  user_ids: string[]

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EncryptedKeyDto)
  @ArrayMinSize(1)
  encryptedKeys: EncryptedKeyDto[]
}
