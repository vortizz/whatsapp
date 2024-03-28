import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class CreateMessageDto {
    @IsNotEmpty()
    @IsMongoId()
    chat: string
    
    @IsNotEmpty()
    @IsMongoId()
    to: string

    @IsNotEmpty()
    @IsString()
    text: string
}