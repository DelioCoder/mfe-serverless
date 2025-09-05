import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsString, ValidateNested } from "class-validator";

export class MetadataDto {

    @IsString()
    plataforma: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => MicroFrontend)
    microfrontends: MicroFrontend[];
}

export class MicroFrontend {

    @IsString()
    id: string;

    @IsString()
    nombre: string;

    @IsString()
    tipo: string;

    @IsString()
    version: string;

    @IsString()
    repositorio: string;

    @IsString()
    estado: string
}