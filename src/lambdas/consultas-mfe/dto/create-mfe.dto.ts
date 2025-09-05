import { IsEmail, IsIn, IsString } from 'class-validator';

export class CreateMfeDto {

    @IsString()
    public nombre: string;
    
    @IsString()
    public dominio: string;

    @IsString()
    @IsIn(['componente', 'pagina', 'widget'])
    public tipo: string;

    @IsString()
    @IsIn(['alta', 'medio', 'baja'])
    public criticidad: string;

    @IsString()
    public estado: string;

    @IsString()
    public descripcion: string;

    @IsString()
    public repositorio: string;

    @IsString()
    public versionReact: string;

    @IsString()
    public versionReactDom: string;

    @IsString()
    public versionMfe: string;

    @IsString()
    public equipo: string;

    @IsString()
    @IsEmail()
    public solicitado_por: string;

}