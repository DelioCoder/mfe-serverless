import { IsEmail, IsIn, IsString } from 'class-validator';

export class CreateMfeDto {

    @IsString()
    public nombre: string;
    
    @IsString()
    @IsIn(['alta', 'media', 'baja'])
    public criticidad: string;
    
    @IsString()
    public descripcion: string;

    @IsString()
    public dominio: string;

    @IsString()
    @IsIn(['componente', 'pagina', 'widget'])
    public tipo: string;

    @IsString()
    public estado: string;
    
    @IsString()
    public arquitecto_solucion: string;
    
    @IsString()
    public desarrolladores: string;
    
    @IsString()
    @IsEmail()
    public solicitado_por: string;

}