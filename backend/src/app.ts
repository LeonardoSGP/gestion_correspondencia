import express, { Application } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { errorMiddleware } from './middlewares/error.middleware';
import { config } from './config';
import { authMiddleware } from './middlewares/auth.middleware';

// Importar routers de modulos
import { authRouter } from './modules/auth/auth.router';
import { usuariosRouter } from './modules/usuarios/usuarios.router';
import { areasRouter } from './modules/areas/areas.router';
import { recepcionRouter } from './modules/recepcion/recepcion.router';
import { distribucionRouter } from './modules/distribucion/distribucion.router';
import { despachoRouter } from './modules/despacho/despacho.router';
import { enrutamientoRouter } from './modules/enrutamiento/enrutamiento.router';
import { archivoRouter } from './modules/archivo/archivo.router';

const app: Application = express();

// Swagger config
const basePath = __dirname.replace(/\\/g, '/');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestion de Correspondencia API',
      version: '1.0.0',
      description: 'API REST -- Sistema Institucional de Gestion de Correspondencia',
    },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    `${basePath}/modules/**/*.router.*`,
    `${basePath}/modules/**/*.schema.*`,
  ],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS bloqueado para el origen: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Archivos estaticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/', (_req, res) => {
  res.json({
    message: 'API del Sistema de Gestion de Correspondencia funcionando',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// -- Rutas ------------------------------------------------------------------
// HU-01, HU-02, HU-05: Autenticacion
app.use('/api/auth', authRouter);
// HU-03, HU-04: Gestion de usuarios, roles y permisos
app.use('/api/usuarios', usuariosRouter);
// Soporte transversal: Areas administrativas
app.use('/api/areas', areasRouter);
// HU-06: Recepcion de correspondencia de entrada
app.use('/api/recepcion', recepcionRouter);
// HU-07: Distribucion interna
app.use('/api/distribucion', distribucionRouter);
// HU-08: Despacho de correspondencia de salida
app.use('/api/despacho', despachoRouter);
// HU-09: Enrutamiento y mensajeria
app.use('/api/enrutamiento', enrutamientoRouter);
// HU-10: Archivo y trazabilidad
app.use('/api/archivo', archivoRouter);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler global (debe ser el ultimo middleware)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorMiddleware(err, req, res, next);
});

export default app;
