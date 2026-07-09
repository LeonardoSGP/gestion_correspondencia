# 📬 Sistema Institucional de Gestión de Correspondencia

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express.js-4-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

---

## 📋 Tabla de Contenidos

- [Resumen del Proyecto](#-resumen-del-proyecto)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [Docker](#-docker)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Contribución](#-contribución)

---

## 📖 Resumen del Proyecto

Sistema diseñado para **digitalizar, controlar y estandarizar** el flujo de correspondencia oficial (entrada y salida) de una institución. Garantiza:

- ✅ **Trazabilidad** completa del ciclo de vida de cada documento
- ✅ **Cumplimiento** de los tiempos de entrega
- ✅ **Resguardo** correcto de acuses de recibo
- ✅ **Estandarización** de procesos de la Unidad Central de Correspondencia (UCC)

El sistema conecta a **remitentes**, **destinatarios**, **personal de mensajería** y **administradores de archivo** en un flujo operativo centralizado.

---

## 🧩 Módulos del Sistema

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| 📥 **Recepción (Entrada)** | Gestión de correspondencia proveniente del exterior dirigida a la institución | 🔲 Pendiente |
| 📤 **Despacho (Salida)** | Gestión de correspondencia generada internamente para ser enviada al exterior | 🔲 Pendiente |
| 🚚 **Enrutamiento y Mensajería** | Asignación de rutas, paquetería externa (Correos de México) y mensajería interna | 🔲 Pendiente |
| 🗄️ **Archivo y Trazabilidad** | Almacenamiento de acuses, control de folios y seguimiento del ciclo de vida | 🔲 Pendiente |
| 🔐 **Autenticación** | Login, registro, JWT, roles y permisos | 🔲 Pendiente |

---

## ⚙️ Funcionalidades

### 📥 Recepción (Entrada)
| ID | Funcionalidad | Descripción |
|----|---------------|-------------|
| F1 | Captura y registro | Validación de remitente, anexos y generación de folio único |
| F2 | Clasificación | Por prioridad (urgente, ordinaria) y tipo (confidencial, con valores) |
| F3 | Sellos y acuses | Impresión de sellos digitales y generación de acuses de recibo |
| F4 | Distribución interna | Recolección de firmas de recepción (Fichas de Gestión / Control de Correspondencia) |

### 📤 Despacho (Salida)
| ID | Funcionalidad | Descripción |
|----|---------------|-------------|
| F5 | Solicitudes de envío | Recepción de solicitudes por parte de las Áreas Administrativas (UA/AA) |
| F6 | Validación de salida | Verificación de firmas autógrafas, anexos y etiquetado |
| F7 | Asignación de despacho | Según destino (Local, Nacional, Internacional) e integración con guías de paquetería |
| F8 | Cierre de ciclo | Carga y archivo de acuses físicos digitalizados |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Runtime** | Node.js 20 |
| **Lenguaje** | TypeScript |
| **Framework HTTP** | Express.js 4 |
| **ORM** | Prisma 5 |
| **Base de datos** | MySQL 8.0 |
| **Autenticación** | JWT (jsonwebtoken + bcryptjs) |
| **Validación** | Zod |
| **Documentación API** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **Upload de archivos** | Multer |
| **Testing** | Jest + Supertest |
| **Containerización** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 📁 Estructura del Proyecto

```
gestion_correspondencia/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Integración Continua
│       ├── cd.yml                  # Entrega Continua (Docker Hub)
│       ├── security.yml            # Auditoría de dependencias
│       └── docker-verify.yml       # Verificación de Docker
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Esquema de base de datos
│   │   └── seed.ts                 # Datos iniciales
│   ├── src/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts   # Verificación JWT
│   │   │   ├── error.middleware.ts  # Manejo global de errores
│   │   │   └── role.middleware.ts   # Control de acceso por rol
│   │   ├── modules/
│   │   │   ├── auth/               # Autenticación (router, service, repository, schema, types)
│   │   │   ├── recepcion/          # Módulo de Recepción (Entrada)
│   │   │   ├── despacho/           # Módulo de Despacho (Salida)
│   │   │   ├── mensajeria/         # Módulo de Enrutamiento y Mensajería
│   │   │   └── archivo/            # Módulo de Archivo y Trazabilidad
│   │   ├── app.ts                  # Configuración de Express
│   │   ├── server.ts               # Entry point
│   │   ├── config.ts               # Variables de entorno (Zod)
│   │   ├── errors.ts               # Clase AppError
│   │   └── prisma.config.ts        # Cliente Prisma singleton
│   ├── tests/
│   │   ├── unit/                   # Tests unitarios
│   │   └── jest.setup.ts           # Configuración de Jest
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
├── docker-compose.yml              # Orquestación: MySQL + Backend + Frontend
├── .gitignore
└── README.md                       # ← Estás aquí
```

### Patrón de Módulos (por módulo)

Cada módulo dentro de `src/modules/` sigue esta convención:

```
modulo/
├── modulo.router.ts       # Definición de rutas Express
├── modulo.service.ts      # Lógica de negocio
├── modulo.repository.ts   # Acceso a datos (Prisma)
├── modulo.schema.ts       # Validaciones (Zod)
└── modulo.types.ts        # Interfaces y tipos TypeScript
```

---

## 📋 Requisitos Previos

- **Node.js** ≥ 20.x
- **npm** ≥ 10.x
- **MySQL** 8.0 (local o Docker)
- **Docker** y **Docker Compose** (opcional, para containerización)

---

## 🚀 Instalación y Configuración

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
# Inicializar con Vite (si aún no se ha hecho)
# npx create-vite@latest ./ --template react-ts
npm install
```

---

## 🔐 Variables de Entorno

Copiar `backend/.env.example` a `backend/.env` y configurar:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor Express | `3001` |
| `DB_HOST` | Host de MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `gestion_correspondencia` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASS` | Contraseña de MySQL | `tu_password` |
| `JWT_SECRET` | Secreto para access tokens | `openssl rand -hex 64` |
| `JWT_EXPIRES_IN` | Duración del access token | `15m` |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | `openssl rand -hex 64` |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh token | `7d` |
| `DATABASE_URL` | URL de conexión Prisma | `mysql://root:pass@localhost:3306/db` |
| `FRONTEND_URL` | URL del frontend (para CORS) | `https://tudominio.com` |

---

## ▶️ Ejecución

### Desarrollo (con hot-reload)

```bash
cd backend
npm run dev
# Servidor en http://localhost:3001
# Swagger en http://localhost:3001/api-docs
```

### Producción

```bash
cd backend
npm run build
npm start
```

---

## 🐳 Docker

### Levantar todo el stack con Docker Compose

```bash
docker compose up --build -d
```

| Servicio | Puerto local | Descripción |
|----------|-------------|-------------|
| MySQL | `3307` | Base de datos |
| Backend | `3002` | API REST |
| Frontend | `8080` | Interfaz web |

### Detener servicios

```bash
docker compose down
```

### Detener y eliminar volúmenes

```bash
docker compose down -v
```

---

## 📚 API Documentation

La documentación interactiva de la API está disponible vía **Swagger UI**:

- **Desarrollo:** http://localhost:3001/api-docs
- **Docker:** http://localhost:3002/api-docs

### Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/health` | Estado del servidor |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/register` | Registrar usuario |
| `GET` | `/api/recepcion` | Listar correspondencia de entrada |
| `POST` | `/api/recepcion` | Registrar nueva correspondencia |
| `GET` | `/api/despacho` | Listar correspondencia de salida |
| `POST` | `/api/despacho` | Solicitar envío externo |
| `GET` | `/api/mensajeria/rutas` | Consultar rutas de mensajería |
| `GET` | `/api/archivo/:id/historial` | Historial de un documento |

---

## 🧪 Testing

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

## 🔄 CI/CD

El proyecto incluye **4 workflows** de GitHub Actions:

| Workflow | Archivo | Disparador | Descripción |
|----------|---------|-----------|-------------|
| **CI** | `ci.yml` | Push/PR a `master` | Type-check, tests, build (backend + frontend) |
| **CD** | `cd.yml` | Manual (`workflow_dispatch`) | Build y push de imágenes Docker a Docker Hub |
| **Security** | `security.yml` | Push/PR + cron semanal | Auditoría de dependencias (`npm audit`) |
| **Docker Verify** | `docker-verify.yml` | Cambios en Dockerfiles | Validación de `docker-compose.yml` y build dry-run |

### Secrets requeridos en GitHub

| Secret/Variable | Descripción |
|----------------|-------------|
| `DOCKERHUB_USERNAME` (variable) | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` (secret) | Access Token de Docker Hub |
| `JWT_SECRET` (secret) | Secreto JWT para CI (opcional, tiene fallback) |

---

## 🤝 Contribución

1. Crear una rama desde `master`: `git checkout -b feature/mi-funcionalidad`
2. Hacer commits descriptivos
3. Abrir un Pull Request hacia `master`
4. Esperar a que pasen los checks de CI
5. Solicitar code review

---

## 📄 Licencia

Proyecto institucional de uso interno.

---

<p align="center">
  <sub>Desarrollado con ❤️ para la digitalización de procesos institucionales</sub>
</p>
