# 📦 Catálogo de Microfrontends (MFEs)

Este proyecto implementa un **Catálogo de Microfrontends (MFEs)** con arquitectura **serverless en AWS**, incluyendo Lambdas, API Gateway y DynamoDB.  
Su objetivo es registrar, consultar y administrar los MFEs de la organización, garantizando trazabilidad, control y relaciones entre ellos.

---

## 🚀 Características principales

- **Registro de solicitudes de MFEs** (`/mfes/requests`)
  - Permite a los equipos registrar nuevas solicitudes para incorporar MFEs al catálogo.
- **Gestión de aprobaciones** (`/admin/mfes-request/{id}/approve`)
  - Los administradores pueden aprobar o rechazar solicitudes de MFEs.
- **Consulta de MFEs** (`/mfes` y `/mfes/{term}`)
  - Listado completo de MFEs registrados.
  - Búsqueda de un MFE específico.
- **Relaciones entre MFEs y plataformas** (`/mfe-relaciones/{id}`)
  - Consulta de las dependencias y agrupación de MFEs bajo una misma plataforma.
- **Auditoría y notificaciones**
  - Registro en tabla de auditorías.
  - Envío de notificaciones vía **SNS** al aprobar/rechazar solicitudes.

---

## 🧪 Pruebas

El proyecto incluye **tests de integración** y **unitarios**, organizados en dos carpetas:

### 🔹 Integración (`/integration`)
Pruebas end-to-end que validan la comunicación con la API real:

- `mfes-request.test.ts`  
  - `POST /mfes/requests`: Crea una solicitud de registro de MFE.
- `mfes.test.ts`  
  - `GET /mfes`: Devuelve listado de MFEs.  
  - `GET /mfes/{term}`: Devuelve un MFE filtrado.

### 🔹 Unit Test (`/unit-test`)
Pruebas unitarias que simulan las dependencias de cada Lambda:

- `Consultas-admin-lambda.test.ts`  
  - Aprueba una solicitud existente.  
  - Mock de DynamoDB, auditoría y notificaciones.
- `Consultas-lambda.test.ts`  
  - Lista los MFEs desde DynamoDB.  
  - Prueba de paginación y formato de respuesta.
- `Relaciones-lambda.test.ts`  
  - Devuelve las relaciones de un MFE con su plataforma y MFEs asociados.

---

## 📂 Estructura de carpetas

tests/
├── integration/
│ ├── mfes-request.test.ts
│ └── mfes.test.ts
└── unit-test/
├── Consultas-admin-lambda.test.ts
├── Consultas-lambda.test.ts
└── Relaciones-lambda.test.ts


---

## ⚙️ Variables de entorno

Para ejecutar los tests de integración es necesario definir:

```
env
API_CANAL=<url_api_gateway>
USER_TOKEN=<jwt_valido_usuario>
```

## 📌 Tecnologías utilizadas

- AWS Lambda (consultas, administración, relaciones)

- Amazon DynamoDB (almacenamiento de MFEs, solicitudes y auditorías)

- Amazon SNS (envío de notificaciones)

- API Gateway (exposición de endpoints REST)

- Jest + Axios (framework de pruebas e integración)

- TypeScript