import { Router, Response, NextFunction } from 'express';
import { DistribucionService } from './distribucion.service';
import { createDistribucionSchema, confirmarEntregaSchema, distribucionFilterSchema } from './distribucion.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { AppError } from '../../errors';

const router = Router();
const service = new DistribucionService();

router.use(authMiddleware);

router.post(
  '/',
  requireRole(['ADMIN', 'OPERADOR_UCC']),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = createDistribucionSchema.parse(req.body);
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }
      const distribucion = await service.registrarDistribucion(data, req.user.id);
      res.status(201).json({ data: distribucion });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filtros = distribucionFilterSchema.parse(req.query);
      const distribuciones = await service.listarDistribuciones(filtros);
      res.json({ data: distribuciones });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new AppError('ID inválido', 400);
      }
      const distribucion = await service.obtenerDistribucion(id);
      res.json({ data: distribucion });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/confirmar',
  requireRole(['ADMIN', 'OPERADOR_UCC', 'AREA_ADMINISTRATIVA']),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new AppError('ID inválido', 400);
      }
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }
      const data = confirmarEntregaSchema.parse(req.body);
      const distribucion = await service.confirmarEntrega(id, req.user.id, data.observaciones);
      res.json({ data: distribucion, message: 'Entrega confirmada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
);

export { router as distribucionRouter };
