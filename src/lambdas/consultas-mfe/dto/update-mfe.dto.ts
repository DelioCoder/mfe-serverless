import { IsEmail, IsIn, IsString, ValidateIf } from 'class-validator';

export class UpdateMfeDto {
  
  @IsString()
  @ValidateIf(o => o.nombre !== undefined)
  nombre?: string;
  
  @IsString()
  @ValidateIf(o => o.dominio !== undefined)
  dominio?: string;

  @IsString()
  @IsIn(['componente', 'pagina', 'widget'])
  @ValidateIf(o => o.tipo !== undefined)
  tipo?: string;

  @IsString()
  @IsIn(['alta', 'medio', 'baja'])
  @ValidateIf(o => o.criticidad !== undefined)
  criticidad?: string;

  @IsString()
  @ValidateIf(o => o.estado !== undefined)
  estado?: string;

  @IsString()
  @ValidateIf(o => o.descripcion !== undefined)
  descripcion?: string;

  @IsString()
  @ValidateIf(o => o.repositorio !== undefined)
  repositorio?: string;

  @IsString()
  @ValidateIf(o => o.versionReact !== undefined)
  versionReact?: string;

  @IsString()
  @ValidateIf(o => o.versionReactDom !== undefined)
  versionReactDom?: string;

  @IsString()
  @ValidateIf(o => o.versionMfe !== undefined)
  versionMfe?: string;

  @IsString()
  @ValidateIf(o => o.equipo !== undefined)
  equipo?: string;

  @IsString()
  @IsEmail()
  solicitado_por: string;
}
