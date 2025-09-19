import { IsEmail, IsIn, IsString, ValidateIf } from 'class-validator';

export class UpdateMfeDto {

  @IsString()
  @ValidateIf(o => o.nombre !== undefined)
  nombre?: string;

  @IsString()
  @ValidateIf(o => o.criticidad !== undefined)
  @IsIn(['alta', 'media', 'baja'])
  criticidad?: string;

  @IsString()
  @ValidateIf(o => o.descripcion !== undefined)
  descripcion?: string;

  @IsString()
  @ValidateIf(o => o.dominio !== undefined)
  dominio?: string;

  @IsString()
  @ValidateIf(o => o.tipo !== undefined)
  @IsIn(['componente', 'pagina', 'widget'])
  tipo?: string;

  @IsString()
  @ValidateIf(o => o.estado !== undefined)
  estado?: string;

  @IsString()
  @ValidateIf(o => o.arquitecto_solucion !== undefined)
  arquitecto_solucion?: string;

  @IsString()
  @ValidateIf(o => o.desarrolladores !== undefined)
  desarrolladores?: string;

  @IsString()
  @IsEmail()
  @ValidateIf(o => o.solicitado_por !== undefined)
  solicitado_por?: string;
}
