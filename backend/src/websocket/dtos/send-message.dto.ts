import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class SendMessageDto {
    @IsNotEmpty()
    @IsString()
    text: string

    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    to: string

    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    chat: string
}