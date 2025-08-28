# Flujo Catálogo de MFEs

## API Canal (Expuesta a Cliente)
- Recibe requests de usuarios autenticados (Cognito)
- Endpoints:
  - `GET /mfes`
  - `GET /mfes/{id}`
  - `POST /mfes`
  - `PUT /mfes/{id}`
  - `/admin/mfes` (para admins)

## Lambda Proxy (Canal → Técnica)
- Funciones:
  - Reenvía requests desde API Canal hacia API Técnica
  - Adjunta headers (ej: token Cognito)
  - Maneja logging y errores
- Variable:
  - `API_TECNICA_URL`

## API Técnica (Lógica de negocio)
- Endpoints principales:
  - `/mfes/requests`
    - `GET`: listar solicitudes
    - `POST`: crear solicitud de registro
    - `PUT {id}`: solicitud de actualización
  - `/admin/mfes`
    - `GET`: listar MFEs
    - `PUT {id}/approve`: aprobar solicitud
    - `PUT {id}/reject`: rechazar solicitud
  - `/parser`
    - `POST`: sincronizar desde GitHub (federation.config.js)
  - Futuro:
    - `/mfes/dashboard` (KPIs)
    - `/mfes/graph` (grafo de dependencias)

## Lambdas de negocio

### 📁 consultas
- Maneja `/mfes/requests`
- Inserta en tabla **Solicitudes**
- Estados iniciales: `pending`
- Genera `request_id` con UUID

### 📁 admin
- Maneja `/admin/mfes`
- Operaciones:
  - Aprobar (`approved`)
  - Rechazar (`rejected`)
  - Listar todos
- Actualiza tabla **MFEsCatalog**

### 📁 catalogo-parser
- Maneja `/parser`
- Descarga y parsea `federation.config.js` desde GitHub
- Devuelve config + YAML/JSON

### 📁 canal/proxy
- Conecta API Canal → API Técnica
- Axios → reenvío de requests

## DynamoDB

### Tabla: Solicitudes
- `request_id` (PK)
- `mfe_id` (opcional en updates)
- `type` (create | update)
- `status` (pending)
- `metadata` (JSON)
- `createdAt`

### Tabla: MFEsCatalog
- `mfe_id` (PK)
- `name`
- `description`
- `status` (approved | rejected | pending)
- `yamlConfig`
- `createdAt`, `updatedAt`
