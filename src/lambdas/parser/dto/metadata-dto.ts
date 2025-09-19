import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsIn
} from "class-validator";

export class MetadataDto {
  @IsString()
  app_cmdb: string;

  @IsString()
  module_cmdb: string;

  @IsString()
  categoria: string;

  @IsString()
  @IsIn(['monorepo', 'multirepo', 'multirepo-conexiones', 'host-multi-auth'])
  estructura: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MicroFrontend)
  instancias: MicroFrontend[];
}

export class MicroFrontend {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsString()
  tipo: string;

  @IsString()
  version: string;

  @IsString()
  repositorio: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  estado: string;

  @IsArray()
  @IsString({ each: true })
  funcionalidades: string[];

  // conexiones cruzadas
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Conexion)
  conexiones?: Conexion[];

  // múltiples auth
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authProviders?: string[];
}

export class Conexion {
  @IsString()
  plataforma: string;

  @IsString()
  mfe_id: string;
}
