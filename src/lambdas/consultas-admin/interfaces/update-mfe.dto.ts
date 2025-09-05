import { IsEmail, IsIn, IsOptional, IsString } from "class-validator";

export class UpdateMfeDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  dominio?: string;

  @IsString()
  @IsIn(["componente", "pagina", "widget"])
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsIn(["alta", "medio", "baja"])
  @IsOptional()
  criticidad?: string;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  repositorio?: string;

  @IsString()
  @IsOptional()
  versionReact?: string;

  @IsString()
  @IsOptional()
  versionReactDom?: string;

  @IsString()
  @IsOptional()
  versionMfe?: string;

  @IsString()
  @IsOptional()
  equipo?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  solicitado_por?: string;
}
