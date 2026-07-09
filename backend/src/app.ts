import express, { Application } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import { errorMiddleware } from './middlewares/error.middleware';
import { config } from './config';

// Importar routers de módulos
import { authRouter } from './modules/auth/auth.router';

const app: Application = express();

// Swagger config
const basePath = __dirname.replace(/\\/g, '/');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gestión de Correspondencia API',
      version: '1.0.0',
      description: 'API REST — Sistema Institucional de Gestión de Correspondencia',
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

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/', (_req, res) => {
  res.json({
    message: 'API del Sistema de Gestión de Correspondencia funcionando',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ── Rutas ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// TODO: Registrar rutas de los módulos conforme se desarrollen
// app.use('/api/recepcion', authMiddleware, recepcionRouter);
// app.use('/api/despacho', authMiddleware, despachoRouter);
// app.use('/api/mensajeria', authMiddleware, mensajeriaRouter);
// app.use('/api/archivo', authMiddleware, archivoRouter);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler global (debe ser el último middleware)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorMiddleware(err, req, res, next);
});

export default app;
