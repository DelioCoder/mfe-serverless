import { MfeEntity, MfeRelationEntity } from "../interfaces";

export class MfeMapper {

    public static fromEntityToResponse(entity: MfeEntity, relationMfe: MfeRelationEntity) {
        return {
            mfe_id: entity.mfe_id,
            nombre: entity.nombre,
            criticidad: entity.criticidad,
            descripcion: entity.descripcion,
            app_cmdb: relationMfe.app_cmdb || '',
            module_cmdb: relationMfe.module_cmdb || '',
            categoria: relationMfe.categoria || '',
            repositorio: relationMfe.repositorio || '',
            funcionalidades: relationMfe.funcionalidades || '',
            dominio: entity.dominio,
            tipo: entity.tipo,
            arquitectoSolucion: entity.arquitecto_solucion,
            solicitadoPor: entity.solicitado_por,
            desarrolladores: entity.desarrolladores,
            creado: entity.createdAt
        };
    }


    public static fromEntityToMfEResponse(entity: MfeEntity) {
        return {
            mfe_id: entity.mfe_id,
            nombre: entity.nombre,
            criticidad: entity.criticidad,
            descripcion: entity.descripcion,
            dominio: entity.dominio,
            tipo: entity.tipo,
            estado: entity.estado,
            arquitectoSolucion: entity.arquitecto_solucion,
            solicitadoPor: entity.solicitado_por,
            desarrolladores: entity.desarrolladores,
            creado: entity.createdAt
        };
    }

}