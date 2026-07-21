import { Router } from 'express';
import { RecepcionService } from './recepcion.service';
import { createRecepcionSchema, recepcionFilterSchema } from './recepcion.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { AppError } from '../../errors';

const router = Router();
const service = new RecepcionService();

router.use(authMiddleware);

router.post('/', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res, next) => {
  try {
    const input = createRecepcionSchema.parse(req.body);
    const result = await service.registrar(input, req.user!.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const filters = recepcionFilterSchema.parse(req.query);
    const result = await service.obtenerTodas(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      throw new AppError('ID inválido', 400);
    }
    const result = await service.obtenerPorId(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as recepcionRouter };
