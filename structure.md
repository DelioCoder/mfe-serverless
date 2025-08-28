mfe-backend/
│
├── bin/
│   └── mfe-backend.ts          # entrypoint CDK
│
├── lib/                        # constructos de infraestructura
│   └── constructs/
│       ├── apigateway-canal-construct.ts    # API Canal (fachada + Cognito + proxy a Técnica)
│       ├── apigateway-tecnica-construct.ts  # API Técnica (endpoints internos a Lambdas)
│       ├── dynamodb-construct.ts            # Tablas MFEs, Solicitudes, Relaciones, Auditoría
│       ├── lambda-construct.ts              # Crea Lambdas con sus permisos
│       ├── s3-construct.ts                  # Bucket para parser desde DevOps/GitHub
│       └── cognito-construct.ts             # Pools, grupos, roles
│   └── mfe-backend-stack.ts   # stack principal
│
├── src/
│   ├── lambdas/
│   │   ├── consultas/          # Lambda para usuarios (consultas, solicitudes registro/actualización)
│   │   │   └── index.ts
│   │   ├── admin/              # Lambda para admins (aprobar/rechazar, listar mfes)
│   │   │   └── index.ts
│   │   ├── catalogo-parser/    # Lambda webhook/parser (desde GitHub/DevOps, procesa metadata)
│   │   │   └── index.ts
│   │   └── common/             # código compartido entre Lambdas
│   │       ├── dto/
│   │       │   ├── pagination.dto.ts
│   │       │   └── solicitud.dto.ts
│   │       ├── services/       # lógica desacoplada (ej: dynamo.service.ts)
│   │       └── utils/
│   │           └── logger.ts
│   │
│   ├── layers/
│   │   └── nodejs/             # dependencias comunes (class-validator, uuid, etc.)
│   │       ├── package.json
│   │       └── node_modules/
│   │
│   └── dynamodb/               # definiciones o seed de datos (si aplica)
│
├── test/                       # tests unitarios
│   └── mfe-backend.test.ts
│
├── cdk.json
├── package.json
├── tsconfig.json
└── README.md
