import { Router, Request, Response, NextFunction } from 'express';
import { RecepcionService } from './recepcion.service';
import { createRecepcionSchema, updateEstadoSchema, firmaRecepcionSchema } from './recepcion.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const recepcionService = new RecepcionService();

router.use(authMiddleware);

// GET /api/recepcion
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros = {
      folio: req.query.folio as string,
      estado: req.query.estado as string,
      fechaInicio: req.query.fechaInicio as string,
      fechaFin: req.query.fechaFin as string,
      areaDestinoId: req.query.areaDestinoId ? parseInt(req.query.areaDestinoId as string) : undefined,
    };
    const resultados = await recepcionService.obtenerTodas(filtros);
    res.json({ success: true, data: resultados });
  } catch (error) { next(error); }
});

// GET /api/recepcion/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const correspondencia = await recepcionService.obtenerPorId(id);
    res.json({ success: true, data: correspondencia });
  } catch (error) { next(error); }
});

// POST /api/recepcion
router.post('/', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validated = createRecepcionSchema.parse(req.body);
    const resultado = await recepcionService.registrar(validated, req.user.id);
    res.status(201).json({ success: true, message: 'Correspondencia registrada', data: resultado });
  } catch (error) { next(error); }
});

// PATCH /api/recepcion/:id/estado
router.patch('/:id/estado', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { estado, observaciones } = updateEstadoSchema.parse(req.body);
    const resultado = await recepcionService.cambiarEstado(id, estado, req.user.id, observaciones);
    res.json({ success: true, message: 'Estado actualizado', data: resultado });
  } catch (error) { next(error); }
});

// POST /api/recepcion/:id/sello
router.post('/:id/sello', requireRole(['ADMIN', 'OPERADOR_UCC']), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const resultado = await recepcionService.generarSello(id, req.user.id);
    res.json({ success: true, message: 'Sello digital generado', data: resultado });
  } catch (error) { next(error); }
});

// POST /api/recepcion/:id/firma
router.post('/:id/firma', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { observaciones } = firmaRecepcionSchema.parse(req.body);
    const resultado = await recepcionService.registrarFirma(id, req.user.id, observaciones);
    res.json({ success: true, message: 'Firma de recepcion registrada', data: resultado });
  } catch (error) { next(error); }
});

export { router as recepcionRouter };
