import { Router, Request, Response, NextFunction } from 'express';
import { ArchivoService } from './archivo.service';
import { cargarAcuseSchema } from './archivo.schema';
import { authMiddleware, AuthRequest } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { uploadMiddleware } from '../../middlewares/upload.middleware';

const router = Router();
const archivoService = new ArchivoService();

router.use(authMiddleware);

// GET /api/archivo/buscar
router.get('/buscar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filtros = {
      folio: req.query.folio as string,
      tipo: req.query.tipo as any,
      estado: req.query.estado as string,
      fechaInicio: req.query.fechaInicio as string,
      fechaFin: req.query.fechaFin as string,
      areaOrigenId: req.query.areaOrigenId ? parseInt(req.query.areaOrigenId as string) : undefined,
      areaDestinoId: req.query.areaDestinoId ? parseInt(req.query.areaDestinoId as string) : undefined,
    };
    const resultados = await archivoService.buscar(filtros);
    res.json({ success: true, data: resultados });
  } catch (error) { next(error); }
});

// GET /api/archivo/:id/historial
router.get('/:id/historial', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const historial = await archivoService.obtenerHistorial(id);
    res.json({ success: true, data: historial });
  } catch (error) { next(error); }
});

// POST /api/archivo/:id/acuse
router.post('/:id/acuse', requireRole(['ADMIN', 'OPERADOR_UCC']), uploadMiddleware.single('acuse'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { observaciones } = cargarAcuseSchema.parse(req.body);
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Se requiere el archivo de acuse' });
    }

    // Ruta relativa para guardar en BD
    const archivoUrl = `/uploads/acuses/${req.file.filename}`;

    const resultado = await archivoService.cargarAcuse(id, req.user.id, archivoUrl, observaciones);
    res.json({ success: true, message: 'Acuse cargado y correspondencia cerrada', data: resultado });
  } catch (error) { next(error); }
});

export { router as archivoRouter };
