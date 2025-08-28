import { IsString } from 'class-validator';
export class UpdateMfeDto {

    @IsString()
    public mensaje: string;

}