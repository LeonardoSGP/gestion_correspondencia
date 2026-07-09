# Sistema Institucional de Gestion de Correspondencia

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express.js-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

---

## Tabla de Contenidos

- [Resumen del Proyecto](#resumen-del-proyecto)
- [Modulos del Sistema](#modulos-del-sistema)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnologico](#stack-tecnologico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion y Configuracion](#instalacion-y-configuracion)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecucion](#ejecucion)
- [Docker](#docker)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Contribucion](#contribucion)

---

## Resumen del Proyecto

Sistema diseñado para **digitalizar, controlar y estandarizar** el flujo de correspondencia oficial (entrada y salida) de una institucion. Garantiza:

- **Trazabilidad** completa del ciclo de vida de cada documento
- **Cumplimiento** de los tiempos de entrega
- **Resguardo** correcto de acuses de recibo
- **Estandarizacion** de procesos de la Unidad Central de Correspondencia (UCC)

El sistema conecta a **remitentes**, **destinatarios**, **personal de mensajeria** y **administradores de archivo** en un flujo operativo centralizado.

---

## Modulos del Sistema

| Modulo | Descripcion | Estado |
|--------|-------------|--------|
| **Recepcion (Entrada)** | Gestion de correspondencia proveniente del exterior dirigida a la institucion | Pendiente |
| **Despacho (Salida)** | Gestion de correspondencia generada internamente para ser enviada al exterior | Pendiente |
| **Enrutamiento y Mensajeria** | Asignacion de rutas, paqueteria externa (Correos de Mexico) y mensajeria interna | Pendiente |
| **Archivo y Trazabilidad** | Almacenamiento de acuses, control de folios y seguimiento del ciclo de vida | Pendiente |
| **Autenticacion** | Login, registro, JWT, roles y permisos | Pendiente |

---

## Funcionalidades

### Recepcion (Entrada)
| ID | Funcionalidad | Descripcion |
|----|---------------|-------------|
| F1 | Captura y registro | Validacion de remitente, anexos y generacion de folio unico |
| F2 | Clasificacion | Por prioridad (urgente, ordinaria) y tipo (confidencial, con valores) |
| F3 | Sellos y acuses | Impresion de sellos digitales y generacion de acuses de recibo |
| F4 | Distribucion interna | Recoleccion de firmas de recepcion (Fichas de Gestion / Control de Correspondencia) |

### Despacho (Salida)
| ID | Funcionalidad | Descripcion |
|----|---------------|-------------|
| F5 | Solicitudes de envio | Recepcion de solicitudes por parte de las Areas Administrativas (UA/AA) |
| F6 | Validacion de salida | Verificacion de firmas autografas, anexos y etiquetado |
| F7 | Asignacion de despacho | Segun destino (Local, Nacional, Internacional) e integracion con guias de paqueteria |
| F8 | Cierre de ciclo | Carga y archivo de acuses fisicos digitalizados |

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| **Runtime** | Node.js 20 |
| **Lenguaje** | TypeScript |
| **Framework HTTP** | Express.js 4 |
| **ORM** | Prisma 5 |
| **Base de datos** | MySQL 8.0 |
| **Autenticacion** | JWT (jsonwebtoken + bcryptjs) |
| **Validacion** | Zod |
| **Documentacion API** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **Upload de archivos** | Multer |
| **Testing** | Jest + Supertest |
| **Containerizacion** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## Estructura del Proyecto

```
gestion_correspondencia/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Integracion Continua
│       ├── cd.yml                  # Entrega Continua (Docker Hub)
│       ├── security.yml            # Auditoria de dependencias
│       └── docker-verify.yml       # Verificacion de Docker
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Esquema de base de datos
│   │   └── seed.ts                 # Datos iniciales
│   ├── src/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts   # Verificacion JWT
│   │   │   ├── error.middleware.ts  # Manejo global de errores
│   │   │   └── role.middleware.ts   # Control de acceso por rol
│   │   ├── modules/
│   │   │   ├── auth/               # Autenticacion (router, service, repository, schema, types)
│   │   │   ├── recepcion/          # Modulo de Recepcion (Entrada)
│   │   │   ├── despacho/           # Modulo de Despacho (Salida)
│   │   │   ├── mensajeria/         # Modulo de Enrutamiento y Mensajeria
│   │   │   └── archivo/            # Modulo de Archivo y Trazabilidad
│   │   ├── app.ts                  # Configuracion de Express
│   │   ├── server.ts               # Entry point
│   │   ├── config.ts               # Variables de entorno (Zod)
│   │   ├── errors.ts               # Clase AppError
│   │   └── prisma.config.ts        # Cliente Prisma singleton
│   ├── tests/
│   │   ├── unit/                   # Tests unitarios
│   │   └── jest.setup.ts           # Configuracion de Jest
│   ├── Dockerfile                  # Imagen Docker (multi-stage)
│   ├── docker-entrypoint.sh        # Script de inicio del contenedor
│   ├── .dockerignore
│   ├── .env.example                # Template de variables de entorno
│   ├── package.json
│   ├── tsconfig.json
│   └── tsconfig.build.json
│
├── frontend/                       # Frontend (Vite + React + TypeScript)
│   └── README.md
│
├── docker-compose.yml              # Orquestacion: MySQL + Backend + Frontend
├── claude.md                       # Reglas para asistentes AI
├── .gitignore
└── README.md
```

### Patron de Modulos (por modulo)

Cada modulo dentro de `src/modules/` sigue esta convencion:

```
modulo/
├── modulo.router.ts       # Definicion de rutas Express
├── modulo.service.ts      # Logica de negocio
├── modulo.repository.ts   # Acceso a datos (Prisma)
├── modulo.schema.ts       # Validaciones (Zod)
└── modulo.types.ts        # Interfaces y tipos TypeScript
```

---

## Requisitos Previos

- **Node.js** >= 20.x
- **npm** >= 10.x
- **MySQL** 8.0 (local o Docker)
- **Docker** y **Docker Compose** (opcional, para containerizacion)

---

## Instalacion y Configuracion

### 1. Clonar el repositorio

```bash
git clone https://github.com/LeonardoSGP/gestion_correspondencia.git
cd gestion_correspondencia
```

### 2. Configurar el backend

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Sincronizar esquema con la BD
npx prisma db push

# (Opcional) Ejecutar seed con datos iniciales
npm run seed
```

### 3. Configurar el frontend

```bash
cd frontend
# Inicializar con Vite (si aun no se ha hecho)
# npx create-vite@latest ./ --template react-ts
npm install
```

---

## Variables de Entorno

Copiar `backend/.env.example` a `backend/.env` y configurar:

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor Express | `3001` |
| `DB_HOST` | Host de MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `gestion_correspondencia` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASS` | Contrasena de MySQL | `tu_password` |
| `JWT_SECRET` | Secreto para access tokens | `openssl rand -hex 64` |
| `JWT_EXPIRES_IN` | Duracion del access token | `15m` |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | `openssl rand -hex 64` |
| `JWT_REFRESH_EXPIRES_IN` | Duracion del refresh token | `7d` |
| `DATABASE_URL` | URL de conexion Prisma | `mysql://root:pass@localhost:3306/db` |
| `FRONTEND_URL` | URL del frontend (para CORS) | `https://tudominio.com` |

---

## Ejecucion

### Desarrollo (con hot-reload)

```bash
cd backend
npm run dev
# Servidor en http://localhost:3001
# Swagger en http://localhost:3001/api-docs
```

### Produccion

```bash
cd backend
npm run build
npm start
```

---

## Docker

### Levantar todo el stack con Docker Compose

```bash
docker compose up --build -d
```

| Servicio | Puerto local | Descripcion |
|----------|-------------|-------------|
| MySQL | `3307` | Base de datos |
| Backend | `3002` | API REST |
| Frontend | `8080` | Interfaz web |

### Detener servicios

```bash
docker compose down
```

### Detener y eliminar volumenes

```bash
docker compose down -v
```

---

## API Documentation

La documentacion interactiva de la API esta disponible via **Swagger UI**:

- **Desarrollo:** http://localhost:3001/api-docs
- **Docker:** http://localhost:3002/api-docs

### Endpoints principales

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/health` | Estado del servidor |
| `POST` | `/api/auth/login` | Iniciar sesion |
| `POST` | `/api/auth/register` | Registrar usuario |
| `GET` | `/api/recepcion` | Listar correspondencia de entrada |
| `POST` | `/api/recepcion` | Registrar nueva correspondencia |
| `GET` | `/api/despacho` | Listar correspondencia de salida |
| `POST` | `/api/despacho` | Solicitar envio externo |
| `GET` | `/api/mensajeria/rutas` | Consultar rutas de mensajeria |
| `GET` | `/api/archivo/:id/historial` | Historial de un documento |

---

## Testing

```bash
cd backend

# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Reporte de cobertura
npm run test:coverage
```

---

## CI/CD

El proyecto incluye **4 workflows** de GitHub Actions:

| Workflow | Archivo | Disparador | Descripcion |
|----------|---------|-----------|-------------|
| **CI** | `ci.yml` | Push/PR a `master` | Type-check, tests, build (backend + frontend) |
| **CD** | `cd.yml` | Manual (`workflow_dispatch`) | Build y push de imagenes Docker a Docker Hub |
| **Security** | `security.yml` | Push/PR + cron semanal | Auditoria de dependencias (`npm audit`) |
| **Docker Verify** | `docker-verify.yml` | Cambios en Dockerfiles | Validacion de `docker-compose.yml` y build dry-run |

### Secrets requeridos en GitHub

| Secret/Variable | Descripcion |
|----------------|-------------|
| `DOCKERHUB_USERNAME` (variable) | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` (secret) | Access Token de Docker Hub |
| `JWT_SECRET` (secret) | Secreto JWT para CI (opcional, tiene fallback) |

---

## Contribucion

1. Crear una rama desde `master`: `git checkout -b feature/mi-funcionalidad`
2. Hacer commits descriptivos
3. Abrir un Pull Request hacia `master`
4. Esperar a que pasen los checks de CI
5. Solicitar code review

---

## Licencia

Proyecto institucional de uso interno.
