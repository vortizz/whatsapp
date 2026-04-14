import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class TypingDto {
    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    chatId: string
}
