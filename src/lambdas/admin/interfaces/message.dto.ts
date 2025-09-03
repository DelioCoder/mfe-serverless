import { IsString } from "class-validator";

export class MessageDto {
    @IsString()
    public mensaje: string;
}