import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateMessageDto {
    @IsNotEmpty()
    @IsMongoId()
    chat: string

    @IsOptional()
    @IsMongoId()
    to?: string

    @IsNotEmpty()
    @IsString()
    text: string

    @IsOptional()
    @IsMongoId()
    replyTo?: string

    @IsOptional()
    forwarded?: boolean
}