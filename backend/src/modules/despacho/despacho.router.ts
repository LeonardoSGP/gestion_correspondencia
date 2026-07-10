import { Router, Request, Response, NextFunction } from 'express';
import { DespachoService } from './despacho.service';
import { createDespachoSchema, validarSalidaSchema, asignarDespachoSchema } from './despacho.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const despachoService = new DespachoService();

router.use(authMiddleware);

// GET /api/despacho
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros = {
      folio: req.query.folio as string,
      estado: req.query.estado as string,
      fechaInicio: req.query.fechaInicio as string,
      fechaFin: req.query.fechaFin as string,
      areaOrigenId: req.query.areaOrigenId ? parseInt(req.query.areaOrigenId as string) : undefined,
    };
    const resultados = await despachoService.obtenerTodas(filtros);
    res.json({ success: true, data: resultados });
  } catch (error) { next(error); }
});

// GET /api/despacho/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const correspondencia = await despachoService.obtenerPorId(id);
    res.json({ success: true, data: correspondencia });
  } catch (error) { next(error); }
});

// POST /api/despacho (F5 - Solicitar envio)
router.post('/', requireRole(['ADMIN', 'AREA_ADMINISTRATIVA', 'OPERADOR_UCC']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = createDespachoSchema.parse(req.body);
    const resultado = await despachoService.solicitar(validated, req.user.id);
    res.status(201).json({ success: true, message: 'Solicitud de despacho registrada', data: resultado });
  } catch (error) { next(error); }
});

// PATCH /api/despacho/:id/validar (F6 - Validar firmas/anexos)
router.patch('/:id/validar', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { estado, observaciones } = validarSalidaSchema.parse(req.body);
    const resultado = await despachoService.validarSalida(id, estado, req.user.id, observaciones);
    res.json({ success: true, message: 'Validacion completada', data: resultado });
  } catch (error) { next(error); }
});

// POST /api/despacho/:id/asignar (F7 - Asignar mensajeria)
router.post('/:id/asignar', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const validated = asignarDespachoSchema.parse(req.body);
    const resultado = await despachoService.asignarDespacho(id, req.user.id, validated);
    res.json({ success: true, message: 'Mensajeria asignada', data: resultado });
  } catch (error) { next(error); }
});

export { router as despachoRouter };
