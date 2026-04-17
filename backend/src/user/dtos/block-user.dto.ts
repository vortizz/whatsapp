import { IsMongoId, IsNotEmpty } from 'class-validator'

export class BlockUserDto {
  @IsNotEmpty()
  @IsMongoId()
  user_id: string
}
