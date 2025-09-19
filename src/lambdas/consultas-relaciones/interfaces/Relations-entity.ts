export interface RelationMfeEntity {
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
    authProviders: string[];
    funcionalidades: string[];
    timestamp: number;
}