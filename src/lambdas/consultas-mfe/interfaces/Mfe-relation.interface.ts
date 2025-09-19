export interface MfeRelationEntity {
    relacion_id: string;
    app_cmdb: string;
    module_cmdb: string;
    categoria: string;
    mfe_id: string;
    nombre: string;
    tipo: string;
    version: string;
    repositorio: string;
    path: string;
    estado: string;
    funcionalidades: string[];
    createdAt: number;
}