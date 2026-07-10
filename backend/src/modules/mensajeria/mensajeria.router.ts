import { Router, Request, Response, NextFunction } from 'express';
import { MensajeriaService } from './mensajeria.service';
import { entregarAsignacionSchema, fallarAsignacionSchema } from './mensajeria.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const mensajeriaService = new MensajeriaService();

router.use(authMiddleware);

// GET /api/mensajeria/asignaciones
router.get('/asignaciones', requireRole(['MENSAJERO']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filtros = {
      estado: req.query.estado as any,
      alcance: req.query.alcance as any,
    };
    const asignaciones = await mensajeriaService.obtenerAsignaciones(req.user.id, filtros);
    res.json({ success: true, data: asignaciones });
  } catch (error) { next(error); }
});

// PATCH /api/mensajeria/asignaciones/:id/entregar
router.patch('/asignaciones/:id/entregar', requireRole(['MENSAJERO']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { observaciones } = entregarAsignacionSchema.parse(req.body);
    const resultado = await mensajeriaService.entregar(id, req.user.id, observaciones);
    res.json({ success: true, message: 'Correspondencia marcada como entregada', data: resultado });
  } catch (error) { next(error); }
});

// PATCH /api/mensajeria/asignaciones/:id/fallo
router.patch('/asignaciones/:id/fallo', requireRole(['MENSAJERO']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { observaciones } = fallarAsignacionSchema.parse(req.body);
    const resultado = await mensajeriaService.reportarFallo(id, req.user.id, observaciones);
    res.json({ success: true, message: 'Fallo reportado', data: resultado });
  } catch (error) { next(error); }
});

export { router as mensajeriaRouter };
