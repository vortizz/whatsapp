import { IsArray, IsMongoId, IsNotEmpty, IsString, ArrayMinSize } from "class-validator";

export class CreateGroupChatDto {
    @IsArray()
    @IsMongoId({ each: true })
    @ArrayMinSize(1)
    user_ids: string[]

    @IsString()
    @IsNotEmpty()
    name: string
}
