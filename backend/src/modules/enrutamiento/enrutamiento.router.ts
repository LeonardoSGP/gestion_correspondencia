import { Router, Request, Response, NextFunction } from 'express';
import { EnrutamientoService } from './enrutamiento.service';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { asignarRutaSchema, marcarEntregadaSchema, reportarFalloSchema } from './enrutamiento.schema';

const router = Router();
const service = new EnrutamientoService();

router.use(authMiddleware);

router.post('/', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = asignarRutaSchema.parse(req.body);
    const result = await service.asignarRuta(data, req.user!.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filter = {
      correspondenciaId: req.query.correspondenciaId ? parseInt(req.query.correspondenciaId as string) : undefined,
      mensajeroId: req.query.mensajeroId ? parseInt(req.query.mensajeroId as string) : undefined,
      estado: req.query.estado as string,
      alcance: req.query.alcance as string
    };
    const result = await service.listarRutas(filter);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/metodos-envio', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await service.listarMetodosEnvio();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const result = await service.obtenerRuta(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/entregar', requireRole(['ADMIN', 'OPERADOR_UCC', 'MENSAJERO']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const data = marcarEntregadaSchema.parse(req.body);
    const result = await service.marcarEntregada(id, req.user!.id, data.observaciones);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/fallo', requireRole(['ADMIN', 'OPERADOR_UCC', 'MENSAJERO']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const data = reportarFalloSchema.parse(req.body);
    const result = await service.reportarFallo(id, req.user!.id, data.observaciones);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as enrutamientoRouter };
