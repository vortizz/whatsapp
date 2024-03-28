import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateChatDto {
    @IsNotEmpty()
    @IsMongoId()
    user_id: string
}