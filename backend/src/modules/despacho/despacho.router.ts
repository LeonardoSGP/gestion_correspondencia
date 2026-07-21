import { Router, Request, Response, NextFunction } from 'express';
import { DespachoService } from './despacho.service';
import { createDespachoSchema, despachoFilterSchema } from './despacho.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const service = new DespachoService();

router.use(authMiddleware);

router.post('/', requireRole(['ADMIN', 'OPERADOR_UCC', 'AREA_ADMINISTRATIVA']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const input = createDespachoSchema.parse(req.body);
    const usuarioId = req.user!.id;
    const result = await service.registrar(input, usuarioId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros = despachoFilterSchema.parse(req.query);
    const result = await service.obtenerTodas(filtros);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await service.obtenerPorId(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as despachoRouter };
